/**
 * Lambda Handler — Entry Point
 *
 * Single Lambda function behind API Gateway. Routes requests to the
 * appropriate handler using the Lambda router.
 *
 * Deployed as a single catch-all Lambda function with API Gateway proxy
 * integration. API Gateway forwards all `/{proxy+}` requests here.
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { toHubRequest, toHubContext, toApiGatewayResult } from "./adapter.js";
import { matchRoute } from "./router.js";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const match = matchRoute(event.httpMethod, event.path);

  if (!match) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: "NOT_FOUND",
        message: `No route matches ${event.httpMethod} ${event.path}`,
      }),
    };
  }

  const hubRequest = toHubRequest(event, match.params);
  const hubContext = toHubContext(context);

  try {
    const response = await match.handler(hubRequest, hubContext);
    return toApiGatewayResult(response);
  } catch (error) {
    console.error("Unhandled error in Lambda handler:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      }),
    };
  }
};
