# BRVIN Teachers — Development Plan

**Status:** Operator Console and Core management foundation deployed; first teacher/student runtime remains in progress  
**Rule:** A phase is complete only when its stated evidence is recorded. A planned task is not a deployed capability.

## Phase 0 — Select and validate the first pilot

The first real teacher is participating directly in the standard BRVIN Teachers onboarding process. The working subject is Physics, with Newton's Laws of Motion proposed as the initial three-page topic. See [PILOT_BRIEF.md](PILOT_BRIEF.md) for the teacher onboarding decisions and remaining source/channel/authentication acceptance items. Use the teacher's actual professional/display name in BRVIN Admin; the public repository records only a role label and must not contain the teacher's personal details. This is a genuine teacher-led pilot, not a synthetic tenant or a special internal operating mode.

Do not start broad scaffolding until the first real use case is defined.

Required decisions:
- a real teacher and the teacher's approval to pilot;
- subject and first teaching workflow;
- approved BRVIN knowledge project and at least one retrieval-ready source;
- first channel (Telegram, web or another explicitly selected channel);
- student authentication and teacher/tenant entitlement rules;
- answer style, citation expectations and what counts as a useful answer;
- operator workflow and support expectations;
- expected traffic, usage limits and budget controls.

Record the approved pilot and measurable acceptance tests before Phase 1 is considered complete. Do not create synthetic production teachers, projects, sources or grants to make a dashboard look populated.

## Phase 1 — Repository and application foundation

**Status:** Shared Worker, application D1/tenant profile, protected Operator Console, Core management integration and classroom/source administration deployed. Remaining activation prerequisites: production BRVIN app/environment registration and the separate retrieval v2 Service Binding.

The protected Operator Console, tenant-profile D1 schema and application Access controls are deployed. Consumer release [#42171352464](https://github.com/ashini-x/brvin-teachers/actions/runs/42171352464) applied D1 migrations, deployed the Worker and passed health/Access smoke checks. Classroom/project, collection/bookshelf and PDF source workflows are now deployed, along with the private management binding to Core. Core release [#42171109140](https://github.com/ashini-x/parmar-ai/actions/runs/42171109140) deployed the named management entrypoint and passed paired production smoke tests. Phase 1's app/operator slice is substantially delivered, but the complete pilot is not ready: register the production app/environment in BRVIN Admin, configure the separate retrieval v2 binding, then implement the real teacher/student/channel/model workflow. See [Cloudflare infrastructure status](INFRASTRUCTURE_STATUS.md).

The Operator Console and teacher profile foundation are deployed, as are classroom/collection/source administration and the Core management binding. Complete the BRVIN application/environment registration and separate v2 retrieval binding only after the real pilot and approved source/channel decisions are confirmed. Do not create fake production records.

Build only the remaining capabilities required by the selected pilot:

- workspace, lint/format/typecheck and test commands;
- one runtime Worker and application D1 migration framework;
- validated request/response contracts;
- tenant, teacher, student, channel and session identity model;
- server-side channel registration and tenant resolution;
- tenant configuration and feature-entitlement model;
- structured, redacted logs and request correlation;
- environment separation and secure credential references;
- CI that validates pull requests without production secrets;
- documented local development and test setup.

No provider bot token or production BRVIN identity is required just to create the repository foundation. Do not create unnecessary Workers, databases, Queues or Durable Objects. The existing bootstrap Worker is the one shared runtime; extend it rather than creating another Worker for each channel or teacher.

## Phase 2 — First real channel and BRVIN v2 consumer

- implement one selected channel end-to-end;
- authenticate the channel webhook or web session;
- resolve tenant/student server-side;
- implement the tenant's model orchestration and answer response;
- register BRVIN Teachers and the exact deployed environment in BRVIN Admin, then replace the management binding's fail-closed placeholder with the generated UUID;
- configure and verify the separate `BRVIN_SERVICE` v2 retrieval binding;
- add the BRVIN_SERVICE private Service Binding to brvin-service / BrvinRetrievalApi;
- configure the generated applicationEnvironmentId through trusted Worker deployment props;
- implement the frozen v2 client with strict types and bounded inputs;
- perform the documented connection proof check;
- retrieve evidence from a real approved teacher project;
- preserve correct source and physical PDF page citations;
- demonstrate denial after app-project grant revocation.

This is the first real M11 consumer acceptance candidate. It does not automatically close M11; the BRVIN master plan's current acceptance criteria and evidence remain authoritative.

## Phase 3 — Operator console and reusable capabilities

Prioritize according to observed pilot needs. Likely capabilities include:
- tenant/teacher profile and versioned configuration;
- student search, profile, suspension/reactivation and entitlements;
- channel and bot registration management;
- enabled module/feature controls;
- usage and cost accounting;
- activity history and security audit;
- reusable quiz, mock-test, calculator, leaderboard or vocabulary modules.

Do not build every item before demand is demonstrated. Keep one central operator console, and reuse domain capabilities across channels.

## Phase 4 — Additional channels and scale

Add another channel or frontend only after the shared domain and tenant authorization behavior are tested. Consider additional Workers, Durable Objects, Queues or database partitioning only when measurements or a security boundary justify them.

Potential later work: teacher-scoped self-service, Mini Apps, mobile clients, advanced analytics, payment/entitlement integrations and independent customer deployments. These are not Phase 1 prerequisites.

## Release gates

### Gate A — Safe foundation

- tenant/channel resolution is server-side and covered by negative tests;
- cross-tenant student/session collision tests pass;
- migrations are repeatable and safe;
- no credentials appear in source, client bundles or logs;
- CI checks pass;
- secrets are absent from PR/fork workflows.

### Gate B — Real pilot

- actual teacher and approved content are used;
- one channel request/reply works end-to-end;
- a student cannot select another tenant's project;
- evidence is relevant, scoped and cited;
- unavailable BRVIN/provider services fail safely;
- usage is attributable to tenant/channel/student without logging sensitive content.

### Gate C — BRVIN authorization

- independently registered app/environment connected through private binding;
- live connection verification passes;
- retrieval from a real granted teacher project succeeds;
- grant revocation blocks subsequent retrieval;
- no public route or direct core-database/search access exists.

### Gate D — Operational readiness

- deployment is reproducible and gated;
- logs, error rates and cost/usage are reviewable;
- recovery and rollback procedures are documented and tested;
- operator access is authenticated and role-scoped;
- tenant isolation and secret-handling tests pass.

## Status vocabulary

Use these labels consistently:
- **Planned:** documented intent only.
- **Implemented:** code exists on a branch or main.
- **Tested:** named automated or manual tests passed.
- **Deployed:** the exact version is running in the named environment.
- **Production-verified:** live acceptance evidence confirms the stated behavior.

Never promote a task's status based only on code completion or CI success.
