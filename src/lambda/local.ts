/**
 * Local Development Server
 *
 * Simple Node.js HTTP server that emulates API Gateway locally.
 * Translates Node `http.IncomingMessage` to `APIGatewayProxyEvent` shape,
 * calls the Lambda handler, and writes the response.
 *
 * Usage: `npm start` (builds then runs this file)
 */

import { createServer } from "node:http";
import { handler } from "./handler.js";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

const PORT = parseInt(process.env.PORT || "3000", 10);

const server = createServer(async (req, res) => {
  // Collect body
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const rawBody = Buffer.concat(chunks).toString("utf-8") || null;

  // Build a fake API Gateway event
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const queryParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // Extract path parameters from the URL (basic — the router does real matching)
  const event: APIGatewayProxyEvent = {
    httpMethod: req.method || "GET",
    path: url.pathname,
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v || ""]),
    ),
    queryStringParameters: Object.keys(queryParams).length > 0 ? queryParams : null,
    pathParameters: null,
    body: rawBody,
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };

  const context: Context = {
    functionName: "anchor-hub-local",
    functionVersion: "local",
    invokedFunctionArn: "local",
    memoryLimitInMB: "256",
    awsRequestId: crypto.randomUUID(),
    logGroupName: "local",
    logStreamName: "local",
    callbackWaitsForEmptyEventLoop: false,
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  try {
    const result = await handler(event, context);

    res.writeHead(result.statusCode, result.headers as Record<string, string>);
    res.end(result.body);
  } catch (error) {
    console.error("Local server error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ code: "INTERNAL_ERROR", message: "Local server error" }));
  }
});

server.listen(PORT, () => {
  console.log(`\n  anchor-hub local dev server running on http://localhost:${PORT}`);
  console.log(`  All services using stubs (AUTH_BYPASS=true)\n`);
  console.log(`  Endpoints:`);
  console.log(`    GET  http://localhost:${PORT}/health`);
  console.log(`    GET  http://localhost:${PORT}/me`);
  console.log(`    GET  http://localhost:${PORT}/registry/resolve`);
  console.log(`    POST http://localhost:${PORT}/users/me/installed-apps`);
  console.log(`    DEL  http://localhost:${PORT}/users/me/installed-apps/{clientId}`);
  console.log(`    GET  http://localhost:${PORT}/users/me/installed-apps`);
  console.log(`    GET  http://localhost:${PORT}/clients/{clientId}/install-manifest`);
  console.log();
});
