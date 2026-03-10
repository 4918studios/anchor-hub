/**
 * User Registry Service — DynamoDB Implementation
 *
 * DynamoDB-backed user registry with TTL cache.
 *
 * Table: anchor-hub-users (pk, sk)
 *   - User record:    pk = userId,                       sk = "USER"
 *   - Identity link:  pk = "LINK#<issuer>#<subject>",    sk = "USER"
 *
 * Cache:
 *   - 1-hour TTL, keyed by userId and each identity link
 *   - Lazy expiry on read; explicit bust on write
 *
 * Ported from anchor-log's Cosmos-backed userRegistryService.
 *
 * @see PLAN.md — A2: Wire real DynamoDB tables
 */

import {
  GetCommand,
  PutCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import type { IUserRegistryService } from "../interfaces/userRegistry.js";
import type { UserRecord } from "../../types/user.js";
import {
  getDocClient,
  usersTableName,
  SK_USER,
  userLinkPk,
} from "../../lib/dynamoClient.js";

// =============================================================================
// TTL Cache
// =============================================================================

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

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

export class UserRegistryService implements IUserRegistryService {
  private cache = new TtlCache<UserRecord>();

  async getUserById(userId: string): Promise<UserRecord | null> {
    const cached = this.cache.get(userId);
    if (cached) return cached;

    const doc = getDocClient();
    const table = usersTableName();

    const result = await doc.send(
      new GetCommand({
        TableName: table,
        Key: { pk: userId, sk: SK_USER },
      }),
    );

    if (!result.Item) return null;

    const record = itemToUserRecord(result.Item);
    this.cacheRecord(record);
    return record;
  }

  async getUserByIdentityLink(
    issuer: string,
    subject: string,
  ): Promise<UserRecord | null> {
    const linkKey = userLinkPk(issuer, subject);

    const cached = this.cache.get(linkKey);
    if (cached) return cached;

    const doc = getDocClient();
    const table = usersTableName();

    // Look up the link item to get userId
    const linkResult = await doc.send(
      new GetCommand({
        TableName: table,
        Key: { pk: linkKey, sk: SK_USER },
      }),
    );

    if (!linkResult.Item?.userId) return null;

    const userId = linkResult.Item.userId as string;
    return this.getUserById(userId);
  }

  async createUser(record: UserRecord): Promise<UserRecord> {
    const doc = getDocClient();
    const table = usersTableName();

    const transactItems = [
      {
        Put: {
          TableName: table,
          Item: {
            pk: record.userId,
            sk: SK_USER,
            ...record,
          },
          ConditionExpression: "attribute_not_exists(pk)",
        },
      },
      ...record.identityLinks.map((link) => ({
        Put: {
          TableName: table,
          Item: {
            pk: userLinkPk(link.issuer, link.subject),
            sk: SK_USER,
            userId: record.userId,
          },
        },
      })),
    ];

    await doc.send(new TransactWriteCommand({ TransactItems: transactItems }));

    this.cacheRecord(record);
    return record;
  }

  async updateUser(
    userId: string,
    updates: Partial<UserRecord>,
  ): Promise<UserRecord> {
    const existing = await this.getUserById(userId);
    if (!existing) {
      throw new Error(`User not found: ${userId}`);
    }

    const updated: UserRecord = {
      ...existing,
      ...updates,
      userId, // never overwrite PK
      updatedAt: new Date().toISOString(),
    };

    const doc = getDocClient();
    const table = usersTableName();

    // Determine link changes
    const oldLinks = new Set(
      existing.identityLinks.map((l) => userLinkPk(l.issuer, l.subject)),
    );
    const newLinks = new Set(
      updated.identityLinks.map((l) => userLinkPk(l.issuer, l.subject)),
    );

    const linksToAdd = updated.identityLinks.filter(
      (l) => !oldLinks.has(userLinkPk(l.issuer, l.subject)),
    );
    const linksToRemove = existing.identityLinks.filter(
      (l) => !newLinks.has(userLinkPk(l.issuer, l.subject)),
    );

    const transactItems = [
      {
        Put: {
          TableName: table,
          Item: {
            pk: userId,
            sk: SK_USER,
            ...updated,
          },
        },
      },
      ...linksToAdd.map((link) => ({
        Put: {
          TableName: table,
          Item: {
            pk: userLinkPk(link.issuer, link.subject),
            sk: SK_USER,
            userId,
          },
        },
      })),
      ...linksToRemove.map((link) => ({
        Delete: {
          TableName: table,
          Key: {
            pk: userLinkPk(link.issuer, link.subject),
            sk: SK_USER,
          },
        },
      })),
    ];

    await doc.send(new TransactWriteCommand({ TransactItems: transactItems }));

    this.bustCacheForUser(userId);
    this.cacheRecord(updated);

    return updated;
  }

  async addInstalledApp(userId: string, clientId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Idempotent — skip if already installed
    if (user.installedApps.some((app) => app.clientId === clientId)) {
      return;
    }

    const updatedApps = [
      ...user.installedApps,
      { clientId, installedAt: new Date().toISOString() },
    ];

    await this.updateUser(userId, { installedApps: updatedApps });
  }

  async removeInstalledApp(userId: string, clientId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedApps = user.installedApps.filter(
      (app) => app.clientId !== clientId,
    );

    // Idempotent — skip if not installed
    if (updatedApps.length === user.installedApps.length) {
      return;
    }

    await this.updateUser(userId, { installedApps: updatedApps });
  }

  async hasInstalledApp(userId: string, clientId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    return user.installedApps.some((app) => app.clientId === clientId);
  }

  // ---------------------------------------------------------------------------
  // Cache helpers
  // ---------------------------------------------------------------------------

  private cacheRecord(record: UserRecord): void {
    this.cache.set(record.userId, record);
    for (const link of record.identityLinks) {
      this.cache.set(userLinkPk(link.issuer, link.subject), record);
    }
  }

  private bustCacheForUser(userId: string): void {
    this.cache.bustWhere((r) => r.userId === userId);
  }
}

// =============================================================================
// Item mapping
// =============================================================================

/** Strip DynamoDB key fields (pk, sk) and cast to UserRecord */
function itemToUserRecord(item: Record<string, unknown>): UserRecord {
  const { pk, sk, ...fields } = item;
  return fields as unknown as UserRecord;
}
