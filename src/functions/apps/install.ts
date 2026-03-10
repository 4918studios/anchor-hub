/**
 * Install App Endpoint
 *
 * POST /api/users/me/installed-apps
 *
 * Install a third-party app for the authenticated user.
 * Placeholder — implementation extracted from anchor-log in A3/A4.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../../lib/serviceFactory.js";
import { createAuditedHandler } from "../../lib/auditedHandler.js";

export async function installApp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { auth, errors } = getServices();

  try {
    const identity = await auth.requireIdentity(request);

    // TODO (A3/A4): Extract install logic from anchor-log
    context.log(`Install app requested by user: ${identity.userId}`);

    return {
      status: 501,
      jsonBody: { code: "NOT_IMPLEMENTED", message: "App install not yet implemented — pending A3/A4 extraction" },
    };
  } catch (error) {
    return errors.handleError(error, context);
  }
}

app.http("installApp", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "users/me/installed-apps",
  handler: createAuditedHandler("app.install", installApp),
});
