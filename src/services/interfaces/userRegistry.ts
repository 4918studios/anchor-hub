/**
 * User Registry Service Interface
 *
 * Manages user records in the Cosmos `users` container.
 */

import type { UserRecord } from "../../types/user.js";

export interface IUserRegistryService {
  /**
   * Get a user by their canonical userId.
   */
  getUserById(userId: string): Promise<UserRecord | null>;

  /**
   * Look up a user by an identity link.
   * Primary lookup during auth: JWT (iss, sub) → user record.
   */
  getUserByIdentityLink(issuer: string, subject: string): Promise<UserRecord | null>;

  /**
   * Create a new user record.
   */
  createUser(record: UserRecord): Promise<UserRecord>;

  /**
   * Update an existing user record (partial update).
   */
  updateUser(userId: string, updates: Partial<UserRecord>): Promise<UserRecord>;

  /**
   * Add a third-party app to the user's installed apps.
   * Idempotent.
   */
  addInstalledApp(userId: string, clientId: string): Promise<void>;

  /**
   * Remove a third-party app from the user's installed apps.
   * Idempotent.
   */
  removeInstalledApp(userId: string, clientId: string): Promise<void>;

  /**
   * Check if a user has installed a specific app.
   */
  hasInstalledApp(userId: string, clientId: string): Promise<boolean>;
}
