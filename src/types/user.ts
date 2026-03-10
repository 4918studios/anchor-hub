/**
 * User Types
 *
 * User registry types for the Cosmos `users` container.
 * Each user record represents a person who has authenticated with the platform.
 */

// =============================================================================
// Identity Link
// =============================================================================

/**
 * Maps a user to an external authentication provider.
 */
export interface UserIdentityLink {
  /** Token issuer URL (e.g. "https://clerk.your-app.com") */
  issuer: string;

  /** Provider-specific user ID (e.g. Clerk "user_2abcXYZ") */
  subject: string;

  /** Auth provider name, e.g. "clerk", "google", "github" */
  provider: string;

  /** When this link was created (ISO 8601) */
  linkedAt: string;
}

// =============================================================================
// Entitlements & Features
// =============================================================================

/**
 * User entitlements — access control at the user level.
 */
export interface UserEntitlements {
  /** Whether the user can access the platform at all */
  accessEnabled: boolean;

  /** Optional access expiry (ISO 8601) — null = no expiry */
  accessUntil: string | null;

  /** Subscription tier */
  tier: string;
}

/**
 * User features — granular feature flags.
 */
export type UserFeatures = Record<string, boolean>;

// =============================================================================
// Installed App
// =============================================================================

/**
 * Tracks which third-party apps the user has installed.
 */
export interface InstalledApp {
  /** The clientId of the installed app */
  clientId: string;

  /** When the user installed this app (ISO 8601) */
  installedAt: string;
}

// =============================================================================
// User Record
// =============================================================================

/** User operational status */
export type UserStatus = "active" | "suspended";

/**
 * Full user record stored in the Cosmos `users` container.
 * Partition key: userId.
 */
export interface UserRecord {
  /** Canonical user ID: `usr_<uuidv7>` — platform-owned, provider-neutral */
  userId: string;

  /** User status */
  status: UserStatus;

  /** When user was first auto-provisioned (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;

  /** Authentication provider links (issuer+subject → userId resolution) */
  identityLinks: UserIdentityLink[];

  /** Access control at the user level */
  entitlements: UserEntitlements;

  /** Granular feature flags */
  features: UserFeatures;

  /** Open bag for cross-referencing external systems */
  externalIds: Record<string, string>;

  /** Third-party apps the user has installed */
  installedApps: InstalledApp[];
}
