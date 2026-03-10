# AWS Setup Guide — anchor-hub

How to configure a fresh AWS account for anchor-hub. This covers the resources needed for the **A2 milestone** (real DynamoDB tables) and NATS hosting on Lightsail.

> **Current status:** Local development works with stubs (`npm start`). No AWS resources are needed until you're ready to deploy or wire real database tables.

---

## 1. IAM — Create a deployment user

Create an IAM user (or role) for local development and CI/CD deployment.

### Console steps

1. **IAM → Users → Create user**
   - Name: `anchor-hub-deploy`
   - Access type: Programmatic access (CLI/SDK)

2. **Attach policies** (start minimal, tighten later):
   - `AmazonDynamoDBFullAccess` — for table creation and CRUD
   - `AWSLambda_FullAccess` — for deploying Lambda functions
   - `AmazonAPIGatewayAdministrator` — for API Gateway setup
   - `IAMFullAccess` — only if using CDK/SAM to create roles (can remove after setup)

3. **Create access key** → Download CSV or copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### Configure CLI

```bash
aws configure --profile anchor-hub
# AWS Access Key ID: <from step 3>
# AWS Secret Access Key: <from step 3>
# Default region: us-east-1
# Default output format: json
```

Or set environment variables:

```bash
export AWS_PROFILE=anchor-hub
export AWS_REGION=us-east-1
```

---

## 2. DynamoDB — Create tables

Three tables, all on-demand (pay-per-request, no capacity planning).

### Option A: AWS Console

Create each table manually in **DynamoDB → Tables → Create table**:

#### `anchor-hub-clients`

| Setting | Value |
|---------|-------|
| Table name | `anchor-hub-clients` |
| Partition key | `clientId` (String) |
| Sort key | _(none)_ |
| Capacity mode | On-demand |

After creation, add a **Global Secondary Index**:
- Index name: `provider-identifier-index`
- Partition key: `provider#identifier` (String)
- Projection: All

#### `anchor-hub-users`

| Setting | Value |
|---------|-------|
| Table name | `anchor-hub-users` |
| Partition key | `userId` (String) |
| Sort key | _(none)_ |
| Capacity mode | On-demand |

After creation, add a **Global Secondary Index**:
- Index name: `issuer-subject-index`
- Partition key: `issuer#subject` (String)
- Projection: All

#### `anchor-hub-audit`

| Setting | Value |
|---------|-------|
| Table name | `anchor-hub-audit` |
| Partition key | `userId` (String) |
| Sort key | `timestamp` (String) |
| Capacity mode | On-demand |

After creation, add a **Global Secondary Index**:
- Index name: `requestId-index`
- Partition key: `requestId` (String)
- Projection: All

### Option B: AWS CLI

```bash
# Clients table
aws dynamodb create-table \
  --table-name anchor-hub-clients \
  --attribute-definitions \
    AttributeName=clientId,AttributeType=S \
    AttributeName=providerIdentifier,AttributeType=S \
  --key-schema AttributeName=clientId,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"provider-identifier-index","KeySchema":[{"AttributeName":"providerIdentifier","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Users table
aws dynamodb create-table \
  --table-name anchor-hub-users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=issuerSubject,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes \
    '[{"IndexName":"issuer-subject-index","KeySchema":[{"AttributeName":"issuerSubject","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Audit table
aws dynamodb create-table \
  --table-name anchor-hub-audit \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
    AttributeName=requestId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --global-secondary-indexes \
    '[{"IndexName":"requestId-index","KeySchema":[{"AttributeName":"requestId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Verify

```bash
aws dynamodb list-tables --region us-east-1
# Should show: anchor-hub-clients, anchor-hub-users, anchor-hub-audit
```

---

## 3. Lambda + API Gateway (deployment — future)

> **Not needed yet.** We'll set up deployment infrastructure (SAM or CDK) in a dedicated ADR/task when we're ready to deploy. For now, local development uses `npm start`.

When we get there, the setup will involve:

1. **Lambda function** — Single function (`anchor-hub`) with the built code as handler
2. **API Gateway (HTTP API)** — Catch-all `/{proxy+}` route → Lambda proxy integration
3. **Lambda execution role** — DynamoDB read/write access, CloudWatch logs
4. **Environment variables** on the Lambda:
   - `AWS_REGION`, `DYNAMODB_TABLE_CLIENTS`, `DYNAMODB_TABLE_USERS`, `DYNAMODB_TABLE_AUDIT`
   - `CLERK_JWKS_URL`, `CLERK_ISSUER`
   - `AUTH_BYPASS=false`

---

## 4. Lightsail — NATS server (when ready for B workstream)

> **Not needed yet.** Set up when you start Workstream B (NATS auth callout).

### Create instance

1. **Lightsail → Create instance**
   - Region: us-east-1 (same as Lambda for low latency)
   - Blueprint: OS Only → Ubuntu 22.04 LTS
   - Plan: $5/mo (1 GB RAM, 1 vCPU, 40 GB SSD)
   - Name: `anchor-nats`

2. **Attach static IP** (Lightsail → Networking → Create static IP → Attach)

3. **Open ports** (Lightsail → instance → Networking):
   - TCP 443 (NATS WebSocket + TLS)
   - TCP 4222 (NATS client, optional — for CLI access)
   - TCP 22 (SSH, already open)

### Install NATS

```bash
ssh ubuntu@<static-ip>

# Install NATS server
curl -sf https://binaries.nats.dev/nats-io/nats-server/v2@latest | sh
sudo mv nats-server /usr/local/bin/

# Install nats CLI tools
curl -sf https://binaries.nats.dev/nats-io/natscli/nats@latest | sh
sudo mv nats /usr/local/bin/

# Install nsc
curl -sf https://binaries.nats.dev/nats-io/nsc/nsc@latest | sh
sudo mv nsc /usr/local/bin/
```

### TLS with Let's Encrypt

```bash
# Point a DNS A record to the static IP first (e.g., nats.yourdomain.com)
sudo apt install certbot
sudo certbot certonly --standalone -d nats.yourdomain.com
# Certs land at /etc/letsencrypt/live/nats.yourdomain.com/
```

### NATS config (basic — full config TBD in B workstream)

```hcl
# /etc/nats/nats.conf
listen: 0.0.0.0:4222

websocket {
  listen: "0.0.0.0:443"
  tls {
    cert_file: "/etc/letsencrypt/live/nats.yourdomain.com/fullchain.pem"
    key_file:  "/etc/letsencrypt/live/nats.yourdomain.com/privkey.pem"
  }
}

jetstream {
  store_dir: "/data/nats/jetstream"
  max_mem: 256MB
  max_file: 2GB
}
```

### Run as systemd service

```bash
sudo useradd -r -s /bin/false nats
sudo mkdir -p /data/nats/jetstream
sudo chown nats:nats /data/nats

sudo tee /etc/systemd/system/nats.service > /dev/null <<EOF
[Unit]
Description=NATS Server
After=network.target

[Service]
User=nats
ExecStart=/usr/local/bin/nats-server -c /etc/nats/nats.conf
Restart=always
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable nats
sudo systemctl start nats
sudo systemctl status nats
```

---

## 5. Cost estimate (pre-production)

| Resource | Monthly cost |
|----------|-------------|
| DynamoDB (on-demand, low traffic) | ~$0 (free tier: 25 WCU + 25 RCU, 25 GB) |
| Lambda (low traffic) | ~$0 (free tier: 1M requests/mo) |
| API Gateway (HTTP API) | ~$0 (free tier: 1M calls/mo for 12 months) |
| Lightsail (1 GB) | $5.00 |
| **Total** | **~$5/mo** |

---

## 6. What to do now vs. later

| Now (local dev) | A2 milestone | B workstream |
|-----------------|-------------|--------------|
| `npm install && npm start` | Create DynamoDB tables (section 2) | Lightsail + NATS (section 4) |
| All services use stubs | IAM user for CLI access (section 1) | Auth callout sidecar |
| No AWS resources needed | Wire real DynamoDB services | DNS + TLS |
| | Lambda deploy is a follow-up task | |

---

## References

- [ADR-001: Migrate from Azure to AWS](architecture/decisions/001-migrate-azure-to-aws.md)
- [PLAN.md](../PLAN.md) — Extraction plan and workstream details
- [tasks/STATUS.md](../tasks/STATUS.md) — Current work board
