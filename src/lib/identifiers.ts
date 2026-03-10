/**
 * Identifiers
 *
 * Canonical UUID generators with typed prefixes.
 * Uses UUIDv7 for time-ordered, sortable identifiers.
 */

import { uuidv7 } from "uuidv7";

export function generateUserId(): string {
  return `usr_${uuidv7()}`;
}

export function generateClientId(): string {
  return `cli_${uuidv7()}`;
}

export function generateEventId(): string {
  return `evt_${uuidv7()}`;
}

export function generateRequestId(): string {
  return `req_${uuidv7()}`;
}
