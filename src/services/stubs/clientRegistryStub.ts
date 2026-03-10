/**
 * Client Registry Stub — In-Memory Implementation
 *
 * Uses a Map for in-memory storage. Suitable for local development and testing.
 */

import type { IClientRegistryService } from "../interfaces/clientRegistry.js";
import type { ClientRecord, ClientStatus } from "../../types/client.js";

class ClientRegistryStub implements IClientRegistryService {
  private store = new Map<string, ClientRecord>();

  async getClientById(clientId: string): Promise<ClientRecord | null> {
    return this.store.get(clientId) || null;
  }

  async getClientByIdentityLink(provider: string, identifier: string): Promise<ClientRecord | null> {
    for (const record of this.store.values()) {
      const match = record.identityLinks.some(
        (link) => link.provider === provider && link.identifier === identifier
      );
      if (match) return record;
    }
    return null;
  }

  async createClient(record: ClientRecord): Promise<ClientRecord> {
    if (this.store.has(record.clientId)) {
      throw new Error(`Client already exists: ${record.clientId}`);
    }
    this.store.set(record.clientId, record);
    return record;
  }

  async updateClient(clientId: string, updates: Partial<ClientRecord>): Promise<ClientRecord> {
    const existing = this.store.get(clientId);
    if (!existing) {
      throw new Error(`Client not found: ${clientId}`);
    }

    const updated: ClientRecord = {
      ...existing,
      ...updates,
      clientId,
      updatedAt: new Date().toISOString(),
    };

    this.store.set(clientId, updated);
    return updated;
  }

  async setClientStatus(clientId: string, status: ClientStatus): Promise<void> {
    await this.updateClient(clientId, { status });
  }

  // ---------------------------------------------------------------------------
  // TEST HELPERS
  // ---------------------------------------------------------------------------

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  seed(record: ClientRecord): void {
    this.store.set(record.clientId, record);
  }
}

export const clientRegistryStubSingleton = new ClientRegistryStub();

export function createClientRegistryStub(): IClientRegistryService & {
  clear: () => void;
  size: () => number;
  seed: (record: ClientRecord) => void;
} {
  return new ClientRegistryStub();
}
