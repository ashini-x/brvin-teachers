# Cloudflare Infrastructure Status

**Last verified:** 6 November 2026  
**Repository:** ashini-x/brvin-teachers  
**Account relationship:** Same Cloudflare account that contains the existing BRVIN Workers `parmar-ai` and `brvin-service`.

This file records observed Cloudflare resources. It is a status record, not a deployment configuration. Update it whenever an infrastructure resource is created, changed, deployed or removed.

## 1. Runtime Worker resource

| Field | Verified value |
|---|---|
| Worker name | `brvin-teachers` |
| Worker resource ID | `e0ccfe8aed524e119f91ab5f784bf5be` |
| Created | 6 November 2026 |
| Resource state | Created; no deployed version |
| `deployed_on` | `null` |
| Observability | Enabled |
| Invocation logs | Enabled and persisted |
| Query-string redaction | Enabled |
| Traces | Disabled |
| `workers.dev` | Disabled |
| Preview URLs | Disabled |
| Service bindings | None |
| D1 bindings | None |
| Custom domains/routes | None |

The candidate URL shown by Cloudflare is not active because the `workers.dev` subdomain is disabled and no version is deployed. Do not treat the Worker as serving traffic.

## 2. Existing BRVIN dependency

The same account contains:
- `parmar-ai` — existing control/admin and ingestion/application Worker.
- `brvin-service` — existing private retrieval Worker exposing `BrvinRetrievalApi`.

BRVIN Teachers will later use a private same-account Service Binding named `BRVIN_SERVICE` targeting `brvin-service` and the `BrvinRetrievalApi` entrypoint. The binding has **not** been configured yet.

Do not change either existing Worker as part of BRVIN Teachers setup.

## 3. Not yet provisioned

- BRVIN Teachers application D1 database.
- Worker code/version or production deployment.
- Private BRVIN Service Binding.
- Generated BRVIN `applicationEnvironmentId`.
- GitHub Actions deployment workflow.
- Dedicated Cloudflare CI/CD API token.
- GitHub production Environment and secret/variable configuration.
- Channel credentials, bot/webhook registrations or model-provider credentials.
- Custom domain, routes, Durable Objects, Queues or other optional services.

## 4. Next setup sequence

1. Create a dedicated Cloudflare account API token for CI/CD with **Workers Editor scoped to the existing `brvin-teachers` Worker only**. Do not grant Workers Admin or account-wide Workers Editor for normal deployment.
2. Add that token to the GitHub repository's protected `production` Environment as `CLOUDFLARE_API_TOKEN`. Add the Cloudflare account ID as a non-secret variable named `CLOUDFLARE_ACCOUNT_ID`.
3. Define the real pilot (teacher, subject, source/project, first channel and student authentication) before implementing runtime behavior.
4. Select and initialize the greenfield Cloudflare `cf` CLI project; do not add Wrangler configuration unless the repository adopts Wrangler deliberately.
5. Create the application D1 database and migration plan only after confirming the initial app schema.
6. Implement, test and deploy the runtime through GitHub Actions.
7. Register BRVIN Teachers and the exact deployed environment in BRVIN Admin, obtain the generated `applicationEnvironmentId`, configure the private Service Binding and verify the connection.

The deployment token does not need D1 access merely to deploy a Worker that has a D1 binding. Add narrowly scoped D1 permissions only if CI is later responsible for creating or directly migrating the remote database.
