/**
 * DynamoDB Table Setup
 *
 * Creates the three anchor-hub DynamoDB tables. Use with DynamoDB Local
 * for development, or run once against real AWS for initial provisioning.
 *
 * Usage:
 *   npx tsx scripts/setup-tables.ts
 *   DYNAMODB_ENDPOINT=http://localhost:8000 npx tsx scripts/setup-tables.ts
 *
 * Tables created:
 *   - anchor-hub-clients (pk, sk) — client registry
 *   - anchor-hub-users   (pk, sk) — user registry
 *   - anchor-hub-audit   (requestId) — audit events, GSI on (userId, timestamp)
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  type CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";

const region = process.env.AWS_REGION || "us-east-1";
const endpoint = process.env.DYNAMODB_ENDPOINT || undefined;

const client = new DynamoDBClient({
  region,
  ...(endpoint && { endpoint }),
});

// =============================================================================
// Table definitions
// =============================================================================

const CLIENTS_TABLE: CreateTableCommandInput = {
  TableName: process.env.DYNAMODB_TABLE_CLIENTS || "anchor-hub-clients",
  KeySchema: [
    { AttributeName: "pk", KeyType: "HASH" },
    { AttributeName: "sk", KeyType: "RANGE" },
  ],
  AttributeDefinitions: [
    { AttributeName: "pk", AttributeType: "S" },
    { AttributeName: "sk", AttributeType: "S" },
  ],
  BillingMode: "PAY_PER_REQUEST",
};

const USERS_TABLE: CreateTableCommandInput = {
  TableName: process.env.DYNAMODB_TABLE_USERS || "anchor-hub-users",
  KeySchema: [
    { AttributeName: "pk", KeyType: "HASH" },
    { AttributeName: "sk", KeyType: "RANGE" },
  ],
  AttributeDefinitions: [
    { AttributeName: "pk", AttributeType: "S" },
    { AttributeName: "sk", AttributeType: "S" },
  ],
  BillingMode: "PAY_PER_REQUEST",
};

const AUDIT_TABLE: CreateTableCommandInput = {
  TableName: process.env.DYNAMODB_TABLE_AUDIT || "anchor-hub-audit",
  KeySchema: [
    { AttributeName: "requestId", KeyType: "HASH" },
  ],
  AttributeDefinitions: [
    { AttributeName: "requestId", AttributeType: "S" },
    { AttributeName: "userId", AttributeType: "S" },
    { AttributeName: "timestamp", AttributeType: "S" },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "UserIdIndex",
      KeySchema: [
        { AttributeName: "userId", KeyType: "HASH" },
        { AttributeName: "timestamp", KeyType: "RANGE" },
      ],
      Projection: { ProjectionType: "ALL" },
    },
  ],
  BillingMode: "PAY_PER_REQUEST",
};

// =============================================================================
// Setup
// =============================================================================

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "ResourceNotFoundException"
    ) {
      return false;
    }
    throw error;
  }
}

async function createTable(input: CreateTableCommandInput): Promise<void> {
  const tableName = input.TableName!;

  if (await tableExists(tableName)) {
    console.log(`  ✓ ${tableName} already exists — skipping`);
    return;
  }

  await client.send(new CreateTableCommand(input));
  console.log(`  ✓ ${tableName} created`);
}

async function main(): Promise<void> {
  console.log("\nanchor-hub DynamoDB table setup");
  console.log(`  Region:   ${region}`);
  console.log(`  Endpoint: ${endpoint || "(default AWS)"}\n`);

  await createTable(CLIENTS_TABLE);
  await createTable(USERS_TABLE);
  await createTable(AUDIT_TABLE);

  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error("Table setup failed:", err);
  process.exit(1);
});
