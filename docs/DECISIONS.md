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

### ADR-010 — Hierarchical human-readable reference identifiers

**Status:** Accepted policy; implementation deferred pending coordinated BRVIN core work.

**Decision:** Assign each teacher/tenant a platform-wide `TCH` reference. Assign projects within a tenant, collections within their originating project, and sources within their originating collection. Use the full hierarchical format `TCH-000001-PRJ-001-COL-001-SRC-001`. Each child counter restarts at `001` beneath its parent; display widths are minimums and expand naturally beyond 999. Numbers are never reused.

**Identity rule:** Keep human-readable references separate from immutable system IDs. Tenant UUIDs and BRVIN's real project/collection/source IDs remain authoritative for database joins, permissions and RPC calls. Reference codes are not secrets or authorization tokens.

**Ownership:** This repository allocates tenant references in its own D1. BRVIN in `parmar-ai` allocates project, collection and source references in the BRVIN registry. The tenant reference is passed to BRVIN as non-secret external owner metadata. Shared grants do not create or renumber records; references retain their original registration lineage. Existing Parmar AI/Fatman/AskMoina records are not backfilled.

**Reason:** Operators need to identify which teacher, classroom/project, bookshelf/collection and source a record belongs to without a single global counter becoming confusing. Parent-scoped sequences keep child numbers short and intelligible at scale.

**Consequence:** Add concurrency-safe per-parent counters, uniqueness constraints and lifecycle/history rules only through a coordinated, reviewed implementation in both repositories. Until then, continue using current BRVIN-generated system IDs and do not manually issue these codes.

**Full policy:** [IDENTIFIER_POLICY.md](IDENTIFIER_POLICY.md).

### ADR-011 — Custom-name Operator Console with ChatGPT-inspired dark visual system

**Status:** Accepted UX/product design; implementation not started.

**Decision:** Build one central, protected BRVIN Teachers Operator Console with a searchable teacher directory and a dedicated workspace for each tenant. Operators may enter arbitrary teacher display names (e.g. Aditya Ranjan or Radhika Goel); the application generates the immutable tenant UUID and tenant reference. Names are not unique identifiers. A separate optional student-facing display name may be configured. Teacher, project, collection and source names are editable metadata; each owning backend generates the corresponding system ID and reference.

The screen hierarchy is Overview → Teachers → Teacher workspace → Classroom/project → Bookshelf/collection → Source/document. The workspace is the day-to-day operating surface; BRVIN Admin remains the core knowledge-governance and advanced administration surface. A narrow authenticated BRVIN management interface is required for project/collection/source creation and source operations. The console must not access BRVIN D1, GCS or AI Search directly, and admin writes must not be added to the retrieval v2 RPC.

**Visual direction:** Use a restrained ChatGPT-inspired dark interface: charcoal surfaces, readable neutral typography, subtle borders, compact content-first cards/lists, consistent outline icons and minimal purposeful transitions. Do not use the previous Apple-inspired direction, glassmorphism, glossy gradients, decorative orbs, ambient glow or excessive shadows. Do not use OpenAI logos or claim affiliation; BRVIN retains its own identity.

**Cross-system behavior:** Tenant creation occurs in the consumer D1; knowledge objects are created by BRVIN in its own registry. Model the two-step provisioning as an idempotent resumable workflow with explicit partial-failure states; never claim atomic cross-database success or duplicate objects on retry.

**Reason:** Give operators one predictable, beginner-friendly place to create custom-named teacher workspaces and manage each knowledge hierarchy while preserving system ownership and tenant isolation.

**Full specification:** [OPERATOR_CONSOLE_DESIGN.md](OPERATOR_CONSOLE_DESIGN.md).


### ADR-012 — Retrieval provider portability must preserve the product experience

**Status:** Accepted compatibility direction; implementation not started  
**Decision date:** 8 November 2026  
**Related Core decision:** BRVIN Core ADR-012 in parmar-ai

**Decision:** BRVIN Teachers remains a downstream BRVIN v2 consumer. Core may replace the internal AI Search/Workers AI retrieval implementation with a Vertex AI + Qdrant provider after the Core pilot and staged acceptance gates, but this repository must preserve the existing Operator Console and consumer journey.

The same teacher/project/collection/source workflows, secure upload, five-step progress indicator, physical per-page map, persisted status/error display, retry/recovery, READY gating, retrieval test and source/page citations remain. Only vendor-specific labels may be changed to provider-neutral wording (for example, "AI Search" to "Search index"). Advanced authenticated operator diagnostics may display provider/model information.

This app must not call Qdrant or Vertex AI directly, store their credentials, generate embeddings, own the index or use a vector filter as authorization. It continues to call the private BRVIN v2 binding; Core D1 remains authoritative for app/project/source grants, readiness and quota. The v2 response contract should remain unchanged for this provider migration.

**Reason:** A backend upgrade should improve scale and control without changing the familiar administrator workflow or creating a second knowledge system in the consumer.

**Full acceptance:** [BRVIN_RETRIEVAL_PROVIDER_COMPATIBILITY.md](BRVIN_RETRIEVAL_PROVIDER_COMPATIBILITY.md). Core rollout and rollback gates: [Core migration plan](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_RETRIEVAL_PROVIDER_MIGRATION.md).
