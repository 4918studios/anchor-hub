/**
 * Service Factory
 *
 * Provides service instances based on environment.
 * In development/test mode, returns stubs.
 * In production, returns real DynamoDB-backed implementations.
 *
 * Individual services can be toggled between stub/real via env vars:
 *   USE_REAL_CLIENT_REGISTRY=true
 *   USE_REAL_USER_REGISTRY=true
 *   USE_REAL_AUDIT_LOGGER=true
 *
 * Auth and Policy remain stubs until A3/A5 extraction.
 */

import type { IAuthService } from "../services/interfaces/auth.js";
import type { IErrorHandler } from "../services/interfaces/errors.js";
import type { IClientRegistryService } from "../services/interfaces/clientRegistry.js";
import type { IUserRegistryService } from "../services/interfaces/userRegistry.js";
import type { IPolicyService } from "../services/interfaces/policy.js";
import type { IAuditLogger } from "../services/interfaces/auditLogger.js";

import { AuthStub, PolicyStub, clientRegistryStubSingleton, userRegistryStubSingleton, auditLoggerStubSingleton } from "../services/stubs/index.js";
import { ClientRegistryService } from "../services/implementations/clientRegistryService.js";
import { UserRegistryService } from "../services/implementations/userRegistryService.js";
import { AuditLoggerService } from "../services/implementations/auditLoggerService.js";
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

/** Check if a specific service should use its real implementation */
function useReal(envVar: string, globalStubs: boolean): boolean {
  // Explicit per-service override takes precedence
  const override = process.env[envVar];
  if (override === "true") return true;
  if (override === "false") return false;

  // Otherwise follow the global mode
  return !globalStubs;
}

/**
 * Get service instances
 *
 * Uses stubs in development mode (AUTH_BYPASS=true or NODE_ENV=development).
 * Uses real implementations in production.
 * Individual services can be overridden with USE_REAL_* env vars.
 */
export function getServices(): Services {
  if (cachedServices) {
    return cachedServices;
  }

  const globalStubs =
    process.env.AUTH_BYPASS === "true" || process.env.NODE_ENV === "development";

  // Auth — stubs until A3 extraction (Clerk JWT validation)
  const auth = new AuthStub();

  // Policy — stubs until A5 (real policy evaluation)
  const policyService = new PolicyStub();

  // Client Registry — DynamoDB or stub
  const clientRegistry: IClientRegistryService = useReal(
    "USE_REAL_CLIENT_REGISTRY",
    globalStubs,
  )
    ? new ClientRegistryService()
    : clientRegistryStubSingleton;

  // User Registry — DynamoDB or stub
  const userRegistry: IUserRegistryService = useReal(
    "USE_REAL_USER_REGISTRY",
    globalStubs,
  )
    ? new UserRegistryService()
    : userRegistryStubSingleton;

  // Audit Logger — DynamoDB or stub
  const auditLogger: IAuditLogger = useReal(
    "USE_REAL_AUDIT_LOGGER",
    globalStubs,
  )
    ? new AuditLoggerService()
    : auditLoggerStubSingleton;

  // Register audit sink so the audited handler wrapper dispatches to the logger
  registerAuditSink((event) => auditLogger.log(event));

  cachedServices = {
    auth,
    errors: new ErrorHandlerImpl(),
    clientRegistry,
    userRegistry,
    policy: policyService,
    auditLogger,
  };

  if (globalStubs) {
    console.log("[ServiceFactory] Using stubs (AUTH_BYPASS=true or NODE_ENV=development)");
  }

  return cachedServices;
}

/**
 * Clear cached services (useful for testing)
 */
export function clearServiceCache(): void {
  cachedServices = null;
}
