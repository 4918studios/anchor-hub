/**
 * Service Factory
 *
 * Provides service instances based on environment.
 * In development/test mode, returns stubs.
 * In production, returns real implementations (wired up in later tasks).
 *
 * Adapted from anchor-log — anchor-hub only needs auth, registries, policy,
 * errors, and audit. No entry/blob/cosmos/workingLane services.
 */

import type { IAuthService } from "../services/interfaces/auth.js";
import type { IErrorHandler } from "../services/interfaces/errors.js";
import type { IClientRegistryService } from "../services/interfaces/clientRegistry.js";
import type { IUserRegistryService } from "../services/interfaces/userRegistry.js";
import type { IPolicyService } from "../services/interfaces/policy.js";
import type { IAuditLogger } from "../services/interfaces/auditLogger.js";

import { AuthStub, PolicyStub, clientRegistryStubSingleton, userRegistryStubSingleton, auditLoggerStubSingleton } from "../services/stubs/index.js";
import { ErrorHandlerImpl } from "./errorHandler.js";
import { registerAuditSink } from "./auditSink.js";

export interface Services {
  auth: IAuthService;
  errors: IErrorHandler;
  clientRegistry: IClientRegistryService;
  userRegistry: IUserRegistryService;
  policy: IPolicyService;
  auditLogger: IAuditLogger;
}

let cachedServices: Services | null = null;

/**
 * Get service instances
 *
 * Uses stubs in development mode (AUTH_BYPASS=true or NODE_ENV=development).
 * Uses real implementations in production (wired in A2–A4).
 */
export function getServices(): Services {
  if (cachedServices) {
    return cachedServices;
  }

  const useStubs = process.env.AUTH_BYPASS === "true" || process.env.NODE_ENV === "development";

  if (useStubs) {
    const auth = new AuthStub();
    const policyService = new PolicyStub();
    const auditLogger = auditLoggerStubSingleton;

    // Register audit sink so the audited handler wrapper dispatches to the logger
    registerAuditSink((event) => auditLogger.log(event));

    cachedServices = {
      auth,
      errors: new ErrorHandlerImpl(),
      clientRegistry: clientRegistryStubSingleton,
      userRegistry: userRegistryStubSingleton,
      policy: policyService,
      auditLogger,
    };

    return cachedServices;
  }

  // Production: Real implementations (wired in A2–A4)
  // For now, fall back to stubs with a warning
  console.warn("[ServiceFactory] Production implementations not yet wired — using stubs");

  const auth = new AuthStub();
  const policyService = new PolicyStub();
  const auditLogger = auditLoggerStubSingleton;

  registerAuditSink((event) => auditLogger.log(event));

  cachedServices = {
    auth,
    errors: new ErrorHandlerImpl(),
    clientRegistry: clientRegistryStubSingleton,
    userRegistry: userRegistryStubSingleton,
    policy: policyService,
    auditLogger,
  };

  return cachedServices;
}

/**
 * Clear cached services (useful for testing)
 */
export function clearServiceCache(): void {
  cachedServices = null;
}
