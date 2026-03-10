/**
 * Service interfaces barrel export
 */

export type { Identity, IAuthService } from "./auth.js";
export type { IErrorHandler } from "./errors.js";
export { ErrorCode } from "./errors.js";
export type { IClientRegistryService } from "./clientRegistry.js";
export type { IUserRegistryService } from "./userRegistry.js";
export type { IAuditLogger, AuditListOptions } from "./auditLogger.js";
export type { IPolicyService, PolicyContext, PolicyDecision, PolicyOperation } from "./policy.js";
