/**
 * Install Manifest Endpoint
 *
 * GET /api/clients/{clientId}/install-manifest
 *
 * Returns a human-readable permission manifest for a third-party app.
 * Placeholder — implementation extracted from anchor-log in A3/A4.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../../lib/serviceFactory.js";
import { createAuditedHandler } from "../../lib/auditedHandler.js";

export async function getInstallManifest(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { errors } = getServices();

  try {
    const clientId = request.params.clientId;

    // TODO (A3/A4): Extract manifest generation from anchor-log
    return {
      status: 501,
      jsonBody: { code: "NOT_IMPLEMENTED", message: "Install manifest not yet implemented — pending A3/A4 extraction" },
    };
  } catch (error) {
    return errors.handleError(error, context);
  }
}

app.http("getInstallManifest", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "clients/{clientId}/install-manifest",
  handler: createAuditedHandler("app.manifest", getInstallManifest),
});
