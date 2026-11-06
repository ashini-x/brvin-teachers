# BRVIN Teachers

**Status:** Protected Operator Console and tenant-profile foundation implemented in PR #1; production release pending merge/deploy  
**Repository:** ashini-x/brvin-teachers  
**Product role:** Multi-tenant teacher application platform and downstream BRVIN v2 consumer

BRVIN Teachers is a separate application platform for operating teacher-specific AI teaching experiences across supported channels. It owns its own tenant, student, channel and application-runtime concerns. It uses the existing BRVIN platform for governed teacher knowledge and private retrieval.

It is **not BRVIN core**, does not replace the existing Parmar AI application, and does not move BRVIN's current production infrastructure out of ashini-x/parmar-ai.

## Two repositories, two responsibilities

| Repository | Responsibility |
|---|---|
| [ashini-x/brvin-teachers](https://github.com/ashini-x/brvin-teachers) | New downstream application: tenant/student/channel identities, teacher configuration, AI orchestration, reusable teaching features, operator console and application operations |
| [ashini-x/parmar-ai](https://github.com/ashini-x/parmar-ai) | Existing Parmar AI application and BRVIN core/admin/ingestion/private retrieval implementation |

The current BRVIN contract and production facts remain authoritative in parmar-ai. This repository documents how the new consumer must use them; it must not create a competing copy of BRVIN's knowledge registry, source ingestion or retrieval authorization.

## Current status

- [x] Separate public repository created.
- [x] Initial architecture and operating documentation established.
- [x] Bootstrap Worker and non-sensitive `/health` endpoint deployed.
- [x] Protected Operator Console implemented in PR #1: Access identity, live teacher directory/search, custom-name creation, generated tenant UUID/reference, workspace view, rename and audit records.
- [x] Separate application D1 database created; initial tenant schema and binding are checked in.
- [ ] Merge/deploy PR #1 and verify application D1 migration and Access identity in production.
- [ ] Implement the separate BRVIN Core management interface for classrooms, collections, source registration, uploads and processing status.
- [ ] Confirm first channel and student authentication/operating-cost decisions.
- [ ] Register the BRVIN Teachers application/environment and private v2 binding.
- [ ] Complete genuine teacher retrieval, isolation and post-revocation denial.

PR #1 adds the operator UI and tenant-profile implementation. Its [validation run](https://github.com/ashini-x/brvin-teachers/actions/runs/42164975951) passed `npm ci`, all unit tests, production build and deployment dry-run; the pull-request deploy job was skipped as intended. The current deployed Worker remains the bootstrap version until PR #1 is merged and its production migration/deploy job succeeds. The application D1 and Access application have been created, but live D1 binding/migration and Access identity propagation still need production verification. See [Cloudflare infrastructure status](docs/INFRASTRUCTURE_STATUS.md).

## Start here

1. [Repository guide](docs/REPOSITORY_GUIDE.md) — two-repository workflow and required reading.
2. [Architecture](docs/ARCHITECTURE.md) — product boundaries, tenant model and target topology.
3. [Development plan](docs/DEVELOPMENT_PLAN.md) — phases and release gates.
4. [Pilot brief](docs/PILOT_BRIEF.md) — current real teacher-led Physics onboarding and Phase 0 decisions.
5. [BRVIN v2 integration](docs/BRVIN_V2_INTEGRATION.md) — exact consumer contract and trust boundary.
6. [Identifier policy](docs/IDENTIFIER_POLICY.md) — approved hierarchical human-readable references for tenants, projects, collections and sources; implementation is pending.
7. [Operator Console design](docs/OPERATOR_CONSOLE_DESIGN.md) — custom teacher names, workspaces, automatic identities and the approved ChatGPT-inspired dark UI direction.
8. [Security](docs/SECURITY.md) — identity, isolation, secrets and evidence handling.
9. [Operations](docs/OPERATIONS.md) — CI/CD, release, logging and recovery.
10. [Architecture decisions](docs/DECISIONS.md) — accepted decisions and deferred questions.
11. [Agent instructions](AGENTS.md) — mandatory instructions for coding assistants.
12. [Cloudflare infrastructure status](docs/INFRASTRUCTURE_STATUS.md) — actual provisioned resources and remaining setup.

## Working principle

**One shared application platform; many isolated teacher experiences; one central operator console; BRVIN remains the knowledge authority.**

Start with a real pilot and the smallest complete, secure experience. Prefer tenant configuration and reusable modules over per-teacher code copies, Workers, databases or repositories. Keep documentation synchronized with accepted code and infrastructure changes.
