/**
 * Client Registry Service — DynamoDB Implementation
 *
 * DynamoDB-backed client registry with TTL cache.
 *
 * Table: anchor-hub-clients (pk, sk)
 *   - Client record:  pk = clientId,                       sk = "CLIENT"
 *   - Identity link:  pk = "LINK#<provider>#<identifier>", sk = "CLIENT"
 *
 * Cache:
 *   - 5-minute TTL, keyed by clientId and each identity link
 *   - Lazy expiry on read; explicit bust on write
 *
 * Ported from anchor-log's Cosmos-backed clientRegistryService.
 *
 * @see PLAN.md — A2: Wire real DynamoDB tables
 */

import {
  GetCommand,
  PutCommand,
  TransactWriteCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import type { IClientRegistryService } from "../interfaces/clientRegistry.js";
import type { ClientRecord, ClientStatus } from "../../types/client.js";
import {
  getDocClient,
  clientsTableName,
  SK_CLIENT,
  clientLinkPk,
} from "../../lib/dynamoClient.js";

// =============================================================================
// TTL Cache
// =============================================================================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  }

  /** Evict all entries whose value matches the predicate */
  bustWhere(predicate: (value: T) => boolean): void {
    for (const [key, entry] of this.store.entries()) {
      if (predicate(entry.value)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}

// =============================================================================
// Implementation
// =============================================================================

export class ClientRegistryService implements IClientRegistryService {
  private cache = new TtlCache<ClientRecord>();

  async getClientById(clientId: string): Promise<ClientRecord | null> {
    // Check cache
    const cached = this.cache.get(clientId);
    if (cached) return cached;

    const doc = getDocClient();
    const table = clientsTableName();

    const result = await doc.send(
      new GetCommand({
        TableName: table,
        Key: { pk: clientId, sk: SK_CLIENT },
      }),
    );

    if (!result.Item) return null;

    const record = itemToClientRecord(result.Item);
    this.cacheRecord(record);
    return record;
  }

  async getClientByIdentityLink(
    provider: string,
    identifier: string,
  ): Promise<ClientRecord | null> {
    const linkKey = clientLinkPk(provider, identifier);

    // Check cache by link key
    const cached = this.cache.get(linkKey);
    if (cached) return cached;

    const doc = getDocClient();
    const table = clientsTableName();

    // Look up the link item to get clientId
    const linkResult = await doc.send(
      new GetCommand({
        TableName: table,
        Key: { pk: linkKey, sk: SK_CLIENT },
      }),
    );

    if (!linkResult.Item?.clientId) return null;

    // Fetch the actual client record
    const clientId = linkResult.Item.clientId as string;
    return this.getClientById(clientId);
  }

  async createClient(record: ClientRecord): Promise<ClientRecord> {
    const doc = getDocClient();
    const table = clientsTableName();

    // Build transaction: client record + all identity link items
    const transactItems = [
      {
        Put: {
          TableName: table,
          Item: {
            pk: record.clientId,
            sk: SK_CLIENT,
            ...record,
          },
          ConditionExpression: "attribute_not_exists(pk)",
        },
      },
      ...record.identityLinks.map((link) => ({
        Put: {
          TableName: table,
          Item: {
            pk: clientLinkPk(link.provider, link.identifier),
            sk: SK_CLIENT,
            clientId: record.clientId,
          },
        },
      })),
    ];

    await doc.send(new TransactWriteCommand({ TransactItems: transactItems }));

    this.cacheRecord(record);
    return record;
  }

  async updateClient(
    clientId: string,
    updates: Partial<ClientRecord>,
  ): Promise<ClientRecord> {
    // Read-modify-write — DynamoDB doesn't support deep partial updates on nested objects
    const existing = await this.getClientById(clientId);
    if (!existing) {
      throw new Error(`Client not found: ${clientId}`);
    }

    const updated: ClientRecord = {
      ...existing,
      ...updates,
      clientId, // never overwrite PK
      updatedAt: new Date().toISOString(),
    };

    const doc = getDocClient();
    const table = clientsTableName();

    // Determine link changes
    const oldLinks = new Set(
      existing.identityLinks.map((l) => clientLinkPk(l.provider, l.identifier)),
    );
    const newLinks = new Set(
      updated.identityLinks.map((l) => clientLinkPk(l.provider, l.identifier)),
    );

    const linksToAdd = updated.identityLinks.filter(
      (l) => !oldLinks.has(clientLinkPk(l.provider, l.identifier)),
    );
    const linksToRemove = existing.identityLinks.filter(
      (l) => !newLinks.has(clientLinkPk(l.provider, l.identifier)),
    );

    // Build transaction
    const transactItems = [
      {
        Put: {
          TableName: table,
          Item: {
            pk: clientId,
            sk: SK_CLIENT,
            ...updated,
          },
        },
      },
      ...linksToAdd.map((link) => ({
        Put: {
          TableName: table,
          Item: {
            pk: clientLinkPk(link.provider, link.identifier),
            sk: SK_CLIENT,
            clientId,
          },
        },
      })),
      ...linksToRemove.map((link) => ({
        Delete: {
          TableName: table,
          Key: {
            pk: clientLinkPk(link.provider, link.identifier),
            sk: SK_CLIENT,
          },
        },
      })),
    ];

    await doc.send(new TransactWriteCommand({ TransactItems: transactItems }));

    // Bust cache for this client (covers old link keys too)
    this.bustCacheForClient(clientId);
    this.cacheRecord(updated);

    return updated;
  }

  async setClientStatus(clientId: string, status: ClientStatus): Promise<void> {
    await this.updateClient(clientId, { status });
  }

  // ---------------------------------------------------------------------------
  // Cache helpers
  // ---------------------------------------------------------------------------

  private cacheRecord(record: ClientRecord): void {
    this.cache.set(record.clientId, record);
    for (const link of record.identityLinks) {
      this.cache.set(clientLinkPk(link.provider, link.identifier), record);
    }
  }

  private bustCacheForClient(clientId: string): void {
    this.cache.bustWhere((r) => r.clientId === clientId);
  }
}

// =============================================================================
// Item mapping
// =============================================================================

/** Strip DynamoDB key fields (pk, sk) and cast to ClientRecord */
function itemToClientRecord(item: Record<string, unknown>): ClientRecord {
  const { pk, sk, ...fields } = item;
  return fields as unknown as ClientRecord;
}
