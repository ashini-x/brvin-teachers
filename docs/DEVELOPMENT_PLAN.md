# BRVIN Teachers — Development Plan

**Status:** Bootstrap runtime deployed; full Phase 1 application foundation remains in progress  
**Rule:** A phase is complete only when its stated evidence is recorded. A planned task is not a deployed capability.

## Phase 0 — Select and validate the first pilot

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

The initial `brvin-teachers` runtime Worker and a non-sensitive `/health` endpoint are implemented and deployed. GitHub Actions run [#4](https://github.com/ashini-x/brvin-teachers/actions/runs/42147596916) verified the committed npm lockfile with clean `npm ci` installs, all three tests, Cloudflare build, deployment dry-run, production deployment and live health verification. The current version is a bootstrap only; Phase 1 is **not complete** because the tenant/student/channel domain, application D1 schema/migrations, secure operator access and full pilot foundation are not yet implemented. See [Cloudflare infrastructure status](INFRASTRUCTURE_STATUS.md).

Build only the foundation required by the selected pilot:

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
- register BRVIN Teachers and the exact deployed environment in BRVIN Admin;
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
