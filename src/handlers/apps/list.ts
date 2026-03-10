/**
 * List Installed Apps Endpoint
 *
 * GET /api/users/me/installed-apps
 *
 * List all apps installed by the authenticated user.
 * Placeholder — implementation extracted from anchor-log in A3/A4.
 */

import type { HubRequest, HubResponse, HubContext } from "../../types/http.js";
import { getServices } from "../../lib/serviceFactory.js";

export async function listInstalledApps(
  request: HubRequest,
  context: HubContext,
): Promise<HubResponse> {
  const { auth, errors } = getServices();

  try {
    const identity = await auth.requireIdentity(request);

    context.log(`List installed apps for user: ${identity.userId}`);

    // TODO (A3/A4): Extract list logic from anchor-log
    return {
      status: 501,
      jsonBody: { code: "NOT_IMPLEMENTED", message: "List installed apps not yet implemented — pending A3/A4 extraction" },
    };
  } catch (error) {
    return errors.handleError(error, context);
  }
}
