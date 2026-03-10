/**
 * Uninstall App Endpoint
 *
 * DELETE /api/users/me/installed-apps/{clientId}
 *
 * Uninstall a third-party app and revoke OAuth consent.
 * Placeholder — implementation extracted from anchor-log in A3/A4.
 */

import type { HubRequest, HubResponse, HubContext } from "../../types/http.js";
import { getServices } from "../../lib/serviceFactory.js";

export async function uninstallApp(
  request: HubRequest,
  context: HubContext,
): Promise<HubResponse> {
  const { auth, errors } = getServices();

  try {
    const identity = await auth.requireIdentity(request);
    const clientId = request.params.clientId;

    context.log(`Uninstall app ${clientId} requested by user: ${identity.userId}`);

    // TODO (A3/A4): Extract uninstall + OAuth revocation logic from anchor-log
    return {
      status: 501,
      jsonBody: { code: "NOT_IMPLEMENTED", message: "App uninstall not yet implemented — pending A3/A4 extraction" },
    };
  } catch (error) {
    return errors.handleError(error, context);
  }
}
