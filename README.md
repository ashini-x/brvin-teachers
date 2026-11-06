# BRVIN Teachers

**Status:** Bootstrap runtime deployed; pilot application implementation not started  
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
- [x] GitHub Actions CI/CD successfully tested against Cloudflare production deployment.
- [ ] Pilot teacher, subject, approved BRVIN project/source and first channel selected.
- [ ] Runtime and database architecture translated into implementation contracts.
- [ ] Full pilot foundation implemented (tenant model, D1 migrations, authentication and selected channel).
- [ ] BRVIN application/environment registered and private v2 binding verified.
- [ ] Genuine teacher-focused retrieval and post-revocation denial acceptance completed.

The Worker now serves a minimal bootstrap health endpoint at [brvin-teachers.thenewtongs.workers.dev/health](https://brvin-teachers.thenewtongs.workers.dev/health). GitHub Actions run #3 passed unit tests, build, deployment dry-run, production deployment and the live health check. This proves the GitHub-to-Cloudflare deployment path works. It does **not** mean the teaching platform is implemented: no application D1 database, tenant/student model, channel integration, BRVIN Service Binding or real retrieval flow exists yet. See [Cloudflare infrastructure status](docs/INFRASTRUCTURE_STATUS.md).

## Start here

1. [Repository guide](docs/REPOSITORY_GUIDE.md) — two-repository workflow and required reading.
2. [Architecture](docs/ARCHITECTURE.md) — product boundaries, tenant model and target topology.
3. [Development plan](docs/DEVELOPMENT_PLAN.md) — phases and release gates.
4. [BRVIN v2 integration](docs/BRVIN_V2_INTEGRATION.md) — exact consumer contract and trust boundary.
5. [Security](docs/SECURITY.md) — identity, isolation, secrets and evidence handling.
6. [Operations](docs/OPERATIONS.md) — CI/CD, release, logging and recovery.
7. [Architecture decisions](docs/DECISIONS.md) — accepted decisions and deferred questions.
8. [Agent instructions](AGENTS.md) — mandatory instructions for coding assistants.
9. [Cloudflare infrastructure status](docs/INFRASTRUCTURE_STATUS.md) — actual provisioned resources and remaining setup.

## Working principle

**One shared application platform; many isolated teacher experiences; one central operator console; BRVIN remains the knowledge authority.**

Start with a real pilot and the smallest complete, secure experience. Prefer tenant configuration and reusable modules over per-teacher code copies, Workers, databases or repositories. Keep documentation synchronized with accepted code and infrastructure changes.
