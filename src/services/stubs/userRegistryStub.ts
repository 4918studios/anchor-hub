/**
 * User Registry Stub — In-Memory Implementation
 *
 * Uses a Map for in-memory storage. Suitable for local development and testing.
 */

import type { IUserRegistryService } from "../interfaces/userRegistry.js";
import type { UserRecord } from "../../types/user.js";

class UserRegistryStub implements IUserRegistryService {
  private store = new Map<string, UserRecord>();

  async getUserById(userId: string): Promise<UserRecord | null> {
    return this.store.get(userId) || null;
  }

  async getUserByIdentityLink(issuer: string, subject: string): Promise<UserRecord | null> {
    for (const record of this.store.values()) {
      const match = record.identityLinks.some(
        (link) => link.issuer === issuer && link.subject === subject
      );
      if (match) return record;
    }
    return null;
  }

  async createUser(record: UserRecord): Promise<UserRecord> {
    if (this.store.has(record.userId)) {
      throw new Error(`User already exists: ${record.userId}`);
    }
    this.store.set(record.userId, record);
    return record;
  }

  async updateUser(userId: string, updates: Partial<UserRecord>): Promise<UserRecord> {
    const existing = this.store.get(userId);
    if (!existing) {
      throw new Error(`User not found: ${userId}`);
    }

    const updated: UserRecord = {
      ...existing,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };

    this.store.set(userId, updated);
    return updated;
  }

  async addInstalledApp(userId: string, clientId: string): Promise<void> {
    const user = this.store.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    if (user.installedApps.some((app) => app.clientId === clientId)) {
      return;
    }

    user.installedApps.push({
      clientId,
      installedAt: new Date().toISOString(),
    });
    this.store.set(userId, user);
  }

  async removeInstalledApp(userId: string, clientId: string): Promise<void> {
    const user = this.store.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    user.installedApps = user.installedApps.filter((app) => app.clientId !== clientId);
    this.store.set(userId, user);
  }

  async hasInstalledApp(userId: string, clientId: string): Promise<boolean> {
    const user = this.store.get(userId);
    if (!user) return false;
    return user.installedApps.some((app) => app.clientId === clientId);
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

  seed(record: UserRecord): void {
    this.store.set(record.userId, record);
  }
}

export const userRegistryStubSingleton = new UserRegistryStub();

export function createUserRegistryStub(): IUserRegistryService & {
  clear: () => void;
  size: () => number;
  seed: (record: UserRecord) => void;
} {
  return new UserRegistryStub();
}
