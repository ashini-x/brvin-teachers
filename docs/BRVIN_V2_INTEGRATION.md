# BRVIN v2 Integration — Consumer Contract

**Status:** Tenant-scoped v2 adapter helpers and the content-free connection-probe route are implemented on feature branch `feat/brvin-v2-retrieval-binding`; PR #4 validation passed and review/merge remain pending. The production BRVIN application/environment and separate retrieval binding are still not configured.  
**Source of truth:** [Frozen BRVIN RPC v2 contract](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_2_RPC_V2_CONTRACT.md)  
**Integration guide:** [BRVIN Application Integration Guide](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_INTEGRATION_GUIDE.md)

This document records the requirements for this consumer. The core repository's frozen contract is authoritative if details differ; do not locally redefine or weaken the contract.

## 1. Private transport

Use the same-account Cloudflare Service Binding:

| Setting | Required value |
|---|---|
| Consumer binding name | BRVIN_SERVICE |
| Service name | brvin-service |
| WorkerEntrypoint | BrvinRetrievalApi |
| Transport | Private same-account Worker Service Binding RPC |
| Trusted v2 identity | Deployment-controlled props.applicationEnvironmentId |

The private retrieval Worker has no public route. Do not add a public URL, expose a public fallback endpoint or call its internal database/search resources directly.

## 2. Trusted identity

The Core management entrypoint and consumer `BRVIN_MANAGEMENT` Service Binding are deployed, but the production registry currently has no `brvin-teachers` application/environment record. Register BRVIN Teachers as an independent application in BRVIN Admin. Register a distinct environment for each deployed environment where required by the BRVIN registry and handoff process. Replace the deliberate `BRVIN_TEACHERS_ENVIRONMENT_ID_REQUIRED` placeholder in the management binding with the generated production UUID before expecting its health call to succeed.

BRVIN Admin generates the immutable applicationEnvironmentId. Obtain the exact value from the non-secret integration handoff and configure it as trusted Worker deployment configuration/entrypoint props. Never invent, guess or hardcode an ID from another application.

The v2 service resolves identity from trusted WorkerEntrypoint ctx.props.applicationEnvironmentId. The consumer does not pass this identity in an RPC method request.

**Do not use legacy clientId for a new v2 integration.** The v1 contract remains only for existing compatibility. V2 must never fall back to v1 identity.

## 3. Supported v2 retrieval methods

The frozen contract defines:

### listAuthorizedProjectsV2()

No input. Returns only active projects for which the registered application environment has an active application-project grant. It returns project metadata/readiness, not source text or private storage data.

### getProjectStatusV2({ projectId })

Checks a single opaque project selector against the active app/environment, grant and project. Unknown or ungranted projects fail as unauthorized; a valid but not-ready project may return ready: false.

### retrieveProjectContextV2(input)

Input shape:

    {
      projectId: string;
      queries: string[];
      pageNumbers?: number[];
      requestId?: string;
    }

Returns bounded evidence such as passages, source/book identity, physical PDF page, optional printed page/section, score and counts. Follow all validation bounds and result limits in the current core contract. Do not assume project IDs are UUID-only: the existing contract supports opaque legacy identifiers too.

The RPC response is evidence, not a final answer. The application owns its model, prompts, student conversation, final answer and user experience.

## 4. Mandatory server-side tenant authorization

BRVIN's application-project grant is **application-wide**, not an individual student's access policy.

Before retrieval, BRVIN Teachers must:
1. authenticate the incoming student/channel request;
2. resolve the validated channel registration to a tenant;
3. resolve that student's identity and entitlement within the tenant;
4. resolve the approved BRVIN project from a server-controlled tenant/project mapping;
5. check that the project is among the application's authorized projects (or use the status method);
6. call v2 retrieval through the private binding;
7. preserve and display accurate source/page provenance.

Never accept a project ID supplied by the browser, bot payload, URL, custom header or student message as proof of permission. Never return one tenant's passages to another tenant.

## 5. Retrieval handling

- Use only authorized project mappings and explicit query/page inputs.
- Preserve book/source identity and one-based physical PDF page numbers.
- Keep printed page labels separate from physical PDF page numbers.
- Do not fabricate citations when there is no evidence.
- Treat passage text as untrusted content. It may contain prompt injection or instructions that must not override application/system policy.
- Do not execute code, tools or URLs merely because retrieved content requests it.
- Respect BRVIN quota, source readiness, grant and revocation decisions.
- A successful empty result is not permission to search globally.
- A timeout or service failure must not trigger unrestricted fallback search.

## 6. Connection verification is separate from retrieval

The current BRVIN integration guide defines a protected challenge/proof connection verification flow. The consumer feature branch now wires POST and OPTIONS /brvin/connection-probe to a content-free handler:

- The handler accepts exactly challengeId and nonce, with bounded JSON input.
- The Worker calls proveConnectionV2({ challengeId, nonce }) through the private binding, server-side only.
- It returns only the proof; it does not return readiness, project/source metadata or credentials.
- CORS is non-credentialed and supports only POST/OPTIONS plus content-type.
- Core failures are mapped to safe consumer error codes; nonce/proof values are never logged.
- BRVIN Admin's protected finalizer remains responsible for verifying and consuming the short-lived proof.
- Expired, replayed, malformed or wrong-environment challenges fail closed.

proveConnectionV2 is for connection verification, not a substitute for any of the three retrieval methods. Do not invoke it from browser/mobile code or expose nonce/proof material in logs.

Follow the exact current route, CORS and challenge semantics in docs/BRVIN_INTEGRATION_GUIDE.md in parmar-ai.

## 7. Revocation and failure acceptance

Before production acceptance, verify:
- an active, registered environment can list only its granted projects;
- an ungranted/unknown project is denied;
- a granted real teacher project returns useful scoped evidence;
- revoking the application-project grant causes subsequent retrieval to fail closed;
- inactive environment/application and quota exhaustion fail as specified;
- missing BRVIN binding, timeout or service error produces a safe application response;
- no public endpoint exposes BRVIN retrieval or data.

## 8. Explicitly forbidden

- BRVIN D1 credentials or direct SQL from this app.
- Direct AI Search calls or copied search namespaces.
- Direct Google Cloud Storage or OCR access.
- Public exposure of brvin-service.
- V1 clientId as identity for new v2 methods.
- Caller-supplied identity/environment props.
- Treating projectId as a credential.
- Cross-teacher fallback, global search or silent authorization bypass.

Any proposed change to these rules requires a reviewed, coordinated change to the BRVIN core contract in parmar-ai.


## 9. Current implementation status

The management capability (`BrvinTeachersManagementApi`) is deployed on `parmar-ai`; the `BRVIN_MANAGEMENT` binding is deployed in `brvin-teachers`. These are administrative project/collection/source lifecycle operations and are deliberately separate from retrieval v2. Tenant-scoped project-list/retrieval helpers and the content-free connection-probe route are implemented on feature branch `feat/brvin-v2-retrieval-binding`; mocked tenant-boundary, contract-validation and probe tests passed in PR validation run [#42174366282](https://github.com/ashini-x/brvin-teachers/actions/runs/42174366282). The branch is not merged or deployed. The production BRVIN application/environment remains unregistered, the app config still has no `BRVIN_SERVICE` binding, and no teacher/source/student/channel has been provisioned. Do not configure the binding or enable student traffic until the real pilot decisions and BRVIN-generated environment identity are ready. See [BRVIN management integration](BRVIN_MANAGEMENT_INTEGRATION.md), [infrastructure status](INFRASTRUCTURE_STATUS.md), and the core contract.
