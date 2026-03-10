/**
 * Function App Entry Point
 *
 * Import all Azure Functions to ensure they are registered with the runtime.
 * Each function file calls app.http() to register itself.
 */

// Health check
import "./health.js";

// Identity
import "./me.js";

// Registry resolution (for NATS auth callout)
import "./registry-resolve.js";

// App lifecycle
import "./apps/install.js";
import "./apps/uninstall.js";
import "./apps/list.js";
import "./apps/install-manifest.js";
