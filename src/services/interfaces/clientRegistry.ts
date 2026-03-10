/**
 * Client Registry Service Interface
 *
 * Manages client application records in the Cosmos `clients` container.
 */

import type { ClientRecord, ClientStatus } from "../../types/client.js";

export interface IClientRegistryService {
  /**
   * Get a client by its canonical clientId.
   */
  getClientById(clientId: string): Promise<ClientRecord | null>;

  /**
   * Look up a client by an identity link identifier.
   * Primary lookup during auth: JWT `azp` → client record.
   */
  getClientByIdentityLink(provider: string, identifier: string): Promise<ClientRecord | null>;

  /**
   * Create a new client record.
   */
  createClient(record: ClientRecord): Promise<ClientRecord>;

  /**
   * Update an existing client record (partial update).
   */
  updateClient(clientId: string, updates: Partial<ClientRecord>): Promise<ClientRecord>;

  /**
   * Set the operational status of a client.
   */
  setClientStatus(clientId: string, status: ClientStatus): Promise<void>;
}
