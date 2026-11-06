# BRVIN Teachers — Target Application Architecture

**Status:** Operator Console and teacher workspace deployed; production BRVIN app/environment registered; private binding activation staged; student/channel runtime remains deferred  
**Decision date:** 6 November 2026  
**Application repository:** ashini-x/brvin-teachers  
**BRVIN core repository:** ashini-x/parmar-ai

This document translates the approved architecture in [BRVIN_TEACHERS_ARCHITECTURE.md](https://github.com/ashini-x/parmar-ai/blob/main/docs/BRVIN_TEACHERS_ARCHITECTURE.md) into the working architecture for this repository. The linked core document remains the original product-design source; this file is the application repository's concise implementation reference.

## 1. Product definition

BRVIN Teachers is a managed, multi-tenant platform for operating teacher-specific AI teaching experiences. A teacher supplies or approves their subject knowledge, teaching approach, style, branding and desired capabilities. The platform operator runs the shared application and its supported channels.

The platform may eventually support Telegram, WhatsApp, web, mobile and Mini Apps. The first channel is **not selected yet**. Do not build every channel in the first release.

The platform owns:
- tenant and teacher profiles;
- student and entitlement identities;
- channel/bot registrations and credential references;
- tenant-specific, versioned teaching configuration;
- conversation/session state;
- AI orchestration and final responses;
- reusable teaching modules;
- operator console, application analytics and cost accounting.

BRVIN owns teacher knowledge:
- source PDFs and private source storage;
- OCR, indexing and source readiness;
- knowledge projects and collections;
- application/environment identity and access grants;
- private retrieval, quotas and audit.

A teacher may have multiple channel identities. They share tenant-level configuration and policies where appropriate, but their external user IDs and sessions must remain isolated by tenant and channel.

## 2. Three systems, separate responsibilities

### Parmar AI

The existing Parmar AI application in ashini-x/parmar-ai remains a standalone SSC teaching product. Its current /admin, student/usage records, Fatman integration, bot identity and production lifecycle must remain intact. It is not automatically a BRVIN Teachers tenant.

Any future Parmar AI migration is a separate project requiring feature parity, explicit data mapping, security and tenant-isolation testing, staged rollout and rollback approval.

### BRVIN core

BRVIN remains in ashini-x/parmar-ai, including the protected parmar-ai control/ingestion Worker and private brvin-service retrieval Worker. BRVIN's D1, AI Search, Google Cloud Storage, OCR and grants remain under BRVIN control.

BRVIN Teachers must not:
- duplicate source PDFs or ingestion pipelines;
- keep its own competing knowledge registry;
- read BRVIN's D1, GCS or AI Search directly;
- bypass BRVIN project/source grants, quota, readiness or audit checks;
- expose the private retrieval Worker publicly.

### BRVIN Teachers

This repository contains only the downstream application and its own application data. It consumes the private BRVIN v2 contract described in [BRVIN_V2_INTEGRATION.md](BRVIN_V2_INTEGRATION.md).

## 3. Tenant and customization model

Use one shared codebase and tenant-aware configuration. Do not copy source trees, Workers, databases or repositories per teacher.

Three customization levels:

| Level | Examples | Preferred implementation |
|---|---|---|
| Configuration | subject, language, tone, teaching method, branding, response style, feature entitlements and quotas | Versioned tenant configuration and feature flags |
| Reusable module | quizzes, mock tests, calculators, leaderboards, flashcards or vocabulary trainers | Shared module with a documented capability contract |
| Bespoke product | genuinely unique UI, workflow or integration | Separate module/service only where configuration and shared modules are inadequate |

Default to configuration. Add a reusable module when it can be tested independently and has a real use case. Bespoke implementation requires an explicit reason such as independent ownership, security isolation or a unique workflow.

Do not scatter teacher-specific conditional logic through shared business logic. Resolve a validated tenant configuration, then pass it into channel-neutral domain services.

## 4. Administration model

There are three distinct administration surfaces:

1. **Parmar AI Admin** — existing standalone Parmar product operations; unchanged.
2. **BRVIN Admin** — knowledge governance, sources, projects, grants, registered apps/environments and BRVIN operations; remains authoritative.
3. **BRVIN Teachers Operator Console** — new central platform console for tenant profiles, teacher configuration, student identities/entitlements, channel registrations, enabled modules, usage/cost visibility and platform operations.

The first release is operator-managed. Teacher self-service is a later option. There should not be one operator console per bot or teacher. The central console must not duplicate BRVIN source ingestion/grant administration.

## 5. Initial deployment topology

Start with the smallest complete topology:

- one runtime Worker for the first pilot;
- one separate application-runtime D1 database;
- private same-account BRVIN Service Binding;
- a Durable Object only when stateful coordination or ordered conversation state justifies it;
- a Queue only when reliable asynchronous processing, retries, buffering or webhook decoupling is required;
- static frontend hosting only if the selected pilot requires a web experience.

A folder or package is not automatically a deployed service. Keep domain boundaries in code first; introduce a separate deployment only for a concrete scaling, security, reliability, provider or release-independence reason.

Do not create one Worker, D1 database, search namespace or OCR pipeline per teacher or bot.

### Suggested code boundaries

Select exact workspace tooling and folder names during implementation, after checking current repository and Cloudflare tooling guidance. The logical boundaries should include:

- runtime: API, request routing and channel webhook ingress;
- tenant-config: versioned teacher configuration and feature flags;
- identity: student, tenant, channel and session resolution;
- ai-orchestrator: channel-neutral model/tool workflow;
- brvin-v2-client: typed client for the private RPC only;
- channel-adapters: the selected provider(s);
- feature-modules: reusable teaching capabilities;
- security: authorization, credential references, encryption and redaction;
- usage-accounting: tenant/student/channel/model usage;
- persistence: application D1 and justified Durable Object repositories;
- operator-console: protected internal administration.

Do not scaffold every optional channel or feature before a pilot requires it.

## 6. Request and data flow

For a student request:

1. Validate the channel webhook or authenticated web request.
2. Resolve the exact channel registration to a tenant using server-side configuration.
3. Resolve the external student identity within that tenant and channel.
4. Apply student status, entitlement, quota and session policy.
5. Load the tenant's versioned teaching configuration and enabled capabilities.
6. Resolve the tenant's approved BRVIN project using a server-side mapping.
7. Retrieve evidence through the private BRVIN v2 binding when the request needs teacher knowledge.
8. Build model context from tenant instructions plus bounded, cited evidence.
9. Generate the response, preserve source/page citations, format it for the channel and record safe usage metadata.
10. Return the response through that channel.

No project ID or tenant ID from an untrusted client may override the server-side mapping. If BRVIN is unavailable, a grant is revoked or the project is unauthorized, do not fall back to an unfiltered search or another teacher's knowledge.

## 7. Data ownership

The application-runtime D1 database may hold tenant profiles, channel registrations, student identity mappings, entitlements, sessions, configuration versions, feature state, usage summaries and audit metadata. It must not become a second copy of BRVIN's source or index database.

Store provider credentials as encrypted secrets or secure secret references with narrowly scoped decryption and rotation. Do not store plaintext tokens in ordinary application tables, GitHub, source code, logs or browser storage.

The actual schema, retention periods, encryption scheme and account-specific deployment names must be designed and reviewed before any production data is written.

## 8. Non-goals

The initial architecture does not authorize:
- migration of Parmar AI into this runtime;
- a teacher-facing self-service builder;
- one repository/Worker/database per teacher;
- all channel integrations in the first release;
- cross-account or public BRVIN retrieval;
- a BRVIN-owned coding agent, provider credential vault or CI/CD system;
- unbounded autonomous production changes.

## 9. Architecture acceptance

The first useful deployment must demonstrate:
- one real tenant and authenticated student flow;
- correct server-side channel-to-tenant resolution;
- isolation tests across tenant and channel identities;
- a selected channel's complete request/reply loop;
- a tenant-specific configuration path;
- private BRVIN v2 retrieval from an approved project;
- source/page provenance in the resulting answer;
- denial after revoking the app-project grant;
- safe failure when BRVIN or a provider is unavailable;
- operator visibility into the tenant, connection and usage without exposing secrets.

## 10. Human-readable reference identifiers

Use the approved hierarchical reference-code policy in [IDENTIFIER_POLICY.md](IDENTIFIER_POLICY.md): one tenant reference (`TCH`), project references scoped to a tenant (`PRJ`), collection references scoped to their originating project (`COL`), and source references scoped to their originating collection (`SRC`). Each child counter restarts at `001` under its parent, so local numbers may repeat while the full path remains unique.

These codes are operator-facing references only. Tenant and BRVIN records retain their immutable system IDs; authorization, database relationships and v2 retrieval continue to use those IDs. Tenant references are allocated by this application's D1; BRVIN allocates project, collection and source references because it owns those records. The TCH allocator and Core PRJ/COL/SRC metadata/sequence implementation are deployed. No production references have yet been issued because no teacher or project has been created in the new workflow.

## 11. Operator Console experience

The central Operator Console is the primary operator-facing control surface for teacher onboarding and workspace operations. Its approved screen flow, custom teacher/project/collection/source names, automatically generated identifiers, workspace navigation, cross-system provisioning/failure states, and responsive ChatGPT-inspired dark visual system are specified in [OPERATOR_CONSOLE_DESIGN.md](OPERATOR_CONSOLE_DESIGN.md).

Teacher names are arbitrary editable display names, not unique keys. New tenant UUID/reference values are allocated by this application's database. PR #1 deployed the Access-authenticated shell, teacher directory/search, custom-name creation, generated tenant UUID/reference, workspace view, rename and audit events. PR #2 deployed classroom/collection/source workflows and the same-account management adapter; Core PR #107 deployed `BrvinTeachersManagementApi`. Consumer release #42174893189 deployed the tenant-scoped v2 helper and content-free connection-probe route. The first real teacher profile exists in application D1 and BRVIN Admin has an active production app/environment. This PR stages the generated trusted environment ID on both private bindings and vendors the pinned v2 connector. No student-facing channel, authentication or model runtime is implemented.


## 12. Management integration and rollout

See [BRVIN_MANAGEMENT_INTEGRATION.md](BRVIN_MANAGEMENT_INTEGRATION.md) for the private management entrypoint, trusted environment binding, ownership checks, available operations, PDF upload lifecycle and rollout steps. It is deliberately separate from the frozen BRVIN retrieval v2 API and does not give this repository direct Core database or storage access.
