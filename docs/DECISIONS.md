# Architecture Decisions

**Status date:** 6 November 2026  
**Scope:** BRVIN Teachers application repository

These decisions capture the currently approved direction. They are not permission to build every future capability immediately. New decisions should include context, alternatives, consequence, status and the repositories affected.

## Accepted decisions

### ADR-001 — Separate downstream repository

**Decision:** Build BRVIN Teachers in ashini-x/brvin-teachers, separate from ashini-x/parmar-ai.

**Reason:** BRVIN Teachers is a consumer application with its own tenant, student, channel, orchestration and operator concerns. BRVIN core and Parmar AI have existing production responsibilities that must remain stable.

**Consequence:** Cross-repository changes require explicit coordination. No broad core refactor is part of the initial application bootstrap.

### ADR-002 — BRVIN remains the knowledge authority

**Decision:** Teacher source ingestion, private storage, OCR, indexing, projects, collections, grants, quotas, audit and retrieval remain owned by BRVIN in parmar-ai.

**Reason:** Avoid duplicate knowledge stores and prevent the consumer from bypassing source readiness and grant governance.

**Consequence:** BRVIN Teachers uses only the frozen v2 private RPC contract for new retrieval. It does not access BRVIN D1, AI Search or GCS directly.

### ADR-003 — Existing Parmar AI remains standalone

**Decision:** Do not migrate Parmar AI into BRVIN Teachers as part of the initial work.

**Reason:** Preserve its existing production application, data, student experience, admin and integrations while the new platform is proven independently.

**Consequence:** Any future migration is a separate approved project with feature parity, data continuity, security, operational and rollback acceptance.

### ADR-004 — Shared multi-tenant application

**Decision:** Use one shared codebase, tenant-aware configuration and reusable feature modules.

**Reason:** Per-teacher source copies and infrastructure increase cost, drift and operational burden.

**Consequence:** Tenant behavior must be configuration/module-driven. A separate deployment requires a measured security, ownership, scaling or release-independence reason.

### ADR-005 — One central Operator Console

**Decision:** Build one central BRVIN Teachers Operator Console for all teachers and channel instances.

**Reason:** Channel identity is not an administration boundary.

**Consequence:** Do not create a separate admin panel or Worker merely because a teacher has another bot. Teacher-facing self-service is optional later work.

### ADR-006 — Initial runtime topology is deliberately small

**Decision:** Start with one runtime Worker and one separate application D1 database; use Durable Objects, Queues, additional Workers and frontends only when justified.

**Reason:** Separate code modules do not automatically require separate infrastructure.

**Consequence:** Document the first pilot's actual state, throughput, isolation and provider needs before adding services.

### ADR-007 — Student authorization belongs to the consumer

**Decision:** BRVIN's application-project grant is application-wide. BRVIN Teachers must authenticate its end users and perform server-side tenant/student-to-project mapping.

**Reason:** A BRVIN app grant cannot express the consumer's individual student/teacher entitlement policy.

**Consequence:** No caller-supplied project or tenant selector is authorization. Tenant isolation is tested in the consumer even when BRVIN retrieval is working correctly.

### ADR-008 — Private BRVIN v2 identity

**Decision:** Use the same-account BRVIN_SERVICE binding to brvin-service / BrvinRetrievalApi, with trusted deployment applicationEnvironmentId.

**Reason:** This is the existing deployed private integration contract.

**Consequence:** Register the consumer app/environment in BRVIN Admin and use the generated identity. Do not expose the private service or use legacy v1 clientId for new calls.

### ADR-009 — Configuration first, module second, bespoke by exception

**Decision:** Teacher customization is versioned configuration by default; reusable capabilities become shared modules; bespoke solutions are exceptional.

**Reason:** Keep common behavior maintainable while accommodating genuine teacher differences.

**Consequence:** Avoid teacher-specific code forks and unbounded conditional branches.

## Deferred decisions

The following must be decided against the actual first pilot, not guessed at repository bootstrap:

- first teacher, subject, source/project and teaching workflow;
- first channel and provider;
- student login/authentication and identity linking method;
- model provider/model, prompt strategy and any tool permissions;
- exact tenant, student, channel and session D1 schema;
- whether Durable Objects are necessary for the first session/conversation behavior;
- whether a Queue is needed for the first provider's webhook/retry requirements;
- credential encryption/key custody strategy for tenant-specific bot credentials;
- workspace/package manager and runtime framework;
- Cloudflare greenfield CLI/configuration after confirming private binding and CI support;
- hosting and custom domain requirements for the Operator Console;
- retention, deletion, backup and recovery requirements.

A deferred item becomes an accepted decision only after its alternatives, trade-offs and implementation impact have been reviewed and documented.
