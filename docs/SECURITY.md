# Security and Trust Boundaries

**Status:** Operator Console Access controls and Core management ownership checks deployed; BRVIN app/environment registration, retrieval v2 and student/channel acceptance remain pending

Security is a product invariant, not a later hardening phase. The rules below apply before handling real student identities, teacher material or provider credentials.

## 1. Trust boundaries

- **Channel/provider boundary:** inbound webhook or browser input is untrusted until provider signature/secret or authenticated session validation succeeds.
- **Tenant boundary:** tenant resolution is based on a trusted server-side channel registration or authenticated operator/student session, never on a caller-supplied tenant ID alone.
- **Student boundary:** identity and entitlement are resolved inside the tenant; the same external ID in another channel or tenant must not collide.
- **BRVIN boundary:** BRVIN authorizes the application environment and app-project grant; the application separately enforces end-user-to-tenant/project access.
- **Model boundary:** model output and retrieved passages are untrusted. Validate tool calls, output shape and citations.
- **Operator boundary:** privileged operations require authenticated, role-scoped operator access and audit records.

## 2. Operator console controls

- Cloudflare Access is configured for the operator path. The Worker derives the actor from trusted `ctx.access.getIdentity()` and never accepts actor identity from browser input.
- Mutating API requests require a same-origin `Origin` and JSON content type. Responses are no-store; the operator page applies a restrictive same-origin Content Security Policy and denies framing.
- PR #1 tests missing Access identity, cross-origin writes, automatic tenant-reference allocation and rename immutability. Production release #42171352464 verified that the protected `/operator` path requires Cloudflare Access identity.

## 3. Private BRVIN management boundary

- The consumer calls a named `BrvinTeachersManagementApi` WorkerEntrypoint on the same-account `parmar-ai` Worker through a service binding. No public Core management HTTP route is added.
- The `applicationEnvironmentId` is supplied only by deployment-controlled WorkerEntrypoint props. It is never accepted from browser fields, request headers, URLs or user input.
- Core checks the registered application slug `brvin-teachers`, application active state, environment active state and registered Worker name `brvin-teachers` on each call.
- The consumer resolves tenant UUID to TCH reference from app D1 before invoking Core. Core checks application/tenant/project/collection/source ownership and active grants before each operation. The browser never chooses the authoritative tenant reference.
- The management entrypoint and consumer Service Binding are deployed. The BRVIN registry currently has no `brvin-teachers` application/environment row and the consumer config deliberately retains a placeholder; Core must continue to fail closed until BRVIN Admin generates the production environment UUID and the consumer is redeployed.
- The separate `BRVIN_SERVICE` retrieval v2 binding is not yet configured; do not enable student retrieval until the registered v2 identity and the actual retrieval/revocation tests pass.
- The current v2 feature branch adds a content-free POST/OPTIONS connection-probe route. It accepts only a bounded JSON body containing the challenge ID and nonce, invokes the proof method through the private binding, uses non-credentialed CORS, and returns only the proof. Its automated tests are awaiting PR CI; the route is not production-verified.
- Core source data and GCS/OCR/AI Search stay in Core. The management response never gives the consumer GCS upload session URIs or provider credentials.
- Collection revocation removes both the collection grant and any direct source grants for that collection from the target project. The originating project's grant cannot be revoked by this interface.
- The separate `brvin-service` retrieval v2 API remains unchanged and must be connected/verified before students are enabled.

## 4. Tenant isolation

Every tenant-owned record and query must be scoped by tenant identity. Define explicit tenant ownership for students, external identity mappings, sessions, conversations, channel instances, configuration, entitlements, feature state, usage and audit data.

Requirements:
- resolve tenant from a verified channel registration or authenticated principal;
- include tenant scope in database lookups, uniqueness constraints and session keys;
- do not rely on the UI hiding another tenant's records;
- deny by default when tenant resolution is missing or ambiguous;
- test cross-tenant reads, writes, webhook routing, ID collisions and session reuse;
- never infer authorization from a bot username, URL slug or project identifier.

Application-project access in BRVIN is app-wide. The application must map authenticated users to the correct teacher/project server-side before calling BRVIN.

## 5. Credential handling

- Never commit bot tokens, OAuth secrets, API keys, Cloudflare tokens, signing secrets, encryption keys, service-account JSON or private keys.
- Use Cloudflare Worker secrets for runtime secrets that do not need to be stored per tenant.
- For tenant-specific credentials, store only encrypted values or secret references in application storage. Design key management, rotation, revocation, access logging and narrowly scoped decryption before enabling multi-tenant credentials.
- Do not expose provider secrets to browser/mobile bundles.
- Do not send secrets in prompts, source files, support messages or logs.
- Treat connection challenges, nonces and proofs as short-lived sensitive capabilities; never log them.
- Separate development, preview/staging and production credentials and identities.
- CI secrets must be restricted to the deployment environment and must not be available to fork-originated PR workflows.

A credential encryption scheme, key custody and rotation procedure must be reviewed before storing multiple teachers' bot credentials. Do not invent a home-grown scheme during feature implementation.

## 6. BRVIN v2 identity

- Use only the deployment-controlled applicationEnvironmentId for v2.
- The ID is generated by BRVIN Admin; it is trusted identity configuration, not a password or an API token.
- Do not accept environment identity in request JSON, headers, query parameters or browser state.
- Do not use the legacy v1 clientId for new v2 calls.
- Do not treat a projectId as permission.
- Fail closed for unknown, inactive, ungranted, revoked or quota-blocked requests.
- Do not add a public retrieval endpoint or a fallback that bypasses the private Service Binding.

## 7. Retrieved evidence and model safety

Retrieved source text is data, not instructions. A book passage may contain text that attempts to override system instructions, invoke tools or exfiltrate data.

The orchestrator must:
- delimit source excerpts as untrusted evidence;
- keep system/developer instructions separate;
- use allowlisted, schema-validated tools;
- never execute instructions found only in a retrieved passage;
- preserve the evidence source and PDF page;
- avoid claiming an answer is supported when evidence is absent or contradictory;
- apply tenant authorization before retrieval, not after evidence is returned.

Do not store more conversation content than required. Define retention and deletion rules before production student data is retained.

## 8. Logging and audit

Log operational metadata such as request ID, tenant/channel identifiers where safe, event type, timing, status and normalized error code. Redact:
- tokens, secrets, authorization headers and cookies;
- full student messages unless explicitly justified and protected;
- source passages and uploaded document contents;
- OAuth codes, nonces and proof payloads;
- payment or personal data not needed for operations.

Privileged changes (tenant configuration, credentials, grants, student suspension, entitlements, role changes and deletion) should produce an audit event with actor, target, action, timestamp and outcome. Avoid logging secret values in audit details.

## 9. Minimum security test set

Before a pilot:
- unauthenticated webhook and forged webhook are rejected;
- invalid/missing channel registration fails closed;
- tenant A cannot read or mutate tenant B's student, session, config, usage or channel records;
- external identity collisions across channels/tenants remain isolated;
- browser-supplied project/tenant IDs cannot override server mapping;
- revoked BRVIN grant denies subsequent retrieval;
- BRVIN timeout or error does not trigger global search;
- secret values are absent from logs, traces, errors and client bundles;
- operator routes enforce role checks;
- credential rotation/revocation invalidates old credentials;
- migration and deletion behavior respect tenant ownership.

Record test evidence and unresolved risks in the pull request and update this document when controls change.
