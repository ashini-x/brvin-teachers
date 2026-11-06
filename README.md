# BRVIN Teachers

**Status:** Operator Console and tenant profiles deployed; classroom/collection/source integration validated in PR #2, coordinated Core implementation validated in PR #107; production activation pending  
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

- [x] Separate public repository and two-repository architecture established.
- [x] Shared Worker, Cloudflare Access and GitHub Actions deployment path verified.
- [x] Application D1 and tenant/audit schema deployed; real teacher profiles are database-backed.
- [x] Protected Operator Console deployed: teacher directory/search, custom-name creation, generated UUID/reference, workspace overview and rename.
- [x] Classroom/collection/source screens and consumer API implemented in PR #2; tests, production build and dry-run passed.
- [x] Separate BRVIN Core management entrypoint, owner metadata, hierarchical reference allocation and scoped source importer implemented in parmar-ai PR #107; Core typecheck/tests/Node tests and both Worker dry-runs passed.
- [ ] Merge/release the Core management PR, then merge/release the consumer PR.
- [ ] Register the BRVIN Teachers production application/environment in BRVIN Admin and replace the deliberate Service Binding placeholder with its generated environment UUID.
- [ ] Verify the private BRVIN v2 retrieval binding and complete real retrieval, tenant isolation and post-revocation denial.
- [ ] Select the first channel and finish student authentication/operating-cost decisions.

PR #1 was merged and deployed. Its production workflow applied the application D1 migration, deployed the Worker, verified public health and confirmed that Cloudflare Access protects `/operator`. PR #2's [validation run](https://github.com/ashini-x/brvin-teachers/actions/runs/42168754952) passed tests, production build and deployment dry-run; its pull-request deploy job was skipped. Core PR #107's [validation run](https://github.com/ashini-x/parmar-ai/actions/runs/42168516646) passed typecheck, tests, Node tests, and both Worker dry-runs; its deploy jobs were skipped. Neither integration PR has been merged or deployed yet. The integration remains inactive until its production environment is registered in BRVIN Admin and the generated environment UUID replaces the fail-closed placeholder. See [BRVIN management integration](docs/BRVIN_MANAGEMENT_INTEGRATION.md) and [Cloudflare infrastructure status](docs/INFRASTRUCTURE_STATUS.md).

## Start here

1. [Repository guide](docs/REPOSITORY_GUIDE.md) — two-repository workflow and required reading.
2. [Architecture](docs/ARCHITECTURE.md) — product boundaries, tenant model and target topology.
3. [Development plan](docs/DEVELOPMENT_PLAN.md) — phases and release gates.
4. [Pilot brief](docs/PILOT_BRIEF.md) — current real teacher-led Physics onboarding and Phase 0 decisions.
5. [BRVIN v2 integration](docs/BRVIN_V2_INTEGRATION.md) — exact consumer contract and trust boundary.
6. [Identifier policy](docs/IDENTIFIER_POLICY.md) — approved hierarchical human-readable references for tenants, projects, collections and sources.
7. [BRVIN management integration](docs/BRVIN_MANAGEMENT_INTEGRATION.md) — private Core management binding, operations and release/activation steps.
8. [Operator Console design](docs/OPERATOR_CONSOLE_DESIGN.md) — custom teacher names, workspaces, automatic identities and the approved ChatGPT-inspired dark UI direction.
9. [Security](docs/SECURITY.md) — identity, isolation, secrets and evidence handling.
10. [Operations](docs/OPERATIONS.md) — CI/CD, release, logging and recovery.
11. [Architecture decisions](docs/DECISIONS.md) — accepted decisions and deferred questions.
12. [Agent instructions](AGENTS.md) — mandatory instructions for coding assistants.
13. [Cloudflare infrastructure status](docs/INFRASTRUCTURE_STATUS.md) — actual provisioned resources and remaining setup.

## Working principle

**One shared application platform; many isolated teacher experiences; one central operator console; BRVIN remains the knowledge authority.**

Start with a real pilot and the smallest complete, secure experience. Prefer tenant configuration and reusable modules over per-teacher code copies, Workers, databases or repositories. Keep documentation synchronized with accepted code and infrastructure changes.
