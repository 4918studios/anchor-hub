/**
 * Install Manifest Endpoint
 *
 * GET /api/clients/{clientId}/install-manifest
 *
 * Returns a human-readable permission manifest for a third-party app.
 * Placeholder — implementation extracted from anchor-log in A3/A4.
 */

import type { HubRequest, HubResponse, HubContext } from "../../types/http.js";
import { getServices } from "../../lib/serviceFactory.js";

export async function getInstallManifest(
  request: HubRequest,
  context: HubContext,
): Promise<HubResponse> {
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
