/**
 * Safe Logger
 *
 * Structured logging with allowlisted metadata keys.
 * Prevents accidental leakage of sensitive data.
 */

type LogLevel = "info" | "warn" | "error";

type SafePrimitive = string | number | boolean | null;

const ALLOWED_META_KEYS = new Set<string>([
  "component",
  "operation",
  "status",
  "statusCode",
  "errorCode",
  "reason",
  "attempt",
  "count",
  "total",
  "durationMs",
  "cacheHit",
]);

function toSafePrimitive(value: unknown): SafePrimitive | undefined {
  if (value === null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return undefined;
}

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, SafePrimitive> | undefined {
  if (!meta) return undefined;

  const sanitized: Record<string, SafePrimitive> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (!ALLOWED_META_KEYS.has(key)) continue;
    const safe = toSafePrimitive(value);
    if (safe !== undefined) {
      sanitized[key] = safe;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const safeMeta = sanitizeMeta(meta);
  if (!safeMeta) {
    console[level](message);
    return;
  }

  console[level](`${message} ${JSON.stringify(safeMeta)}`);
}

export const safeLogger = {
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
