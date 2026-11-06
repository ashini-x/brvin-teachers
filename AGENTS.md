# Engineering Instructions for BRVIN Teachers

These instructions apply to all coding assistants and contributors working in this repository.

## Before work

1. Read this file and docs/REPOSITORY_GUIDE.md.
2. Read the relevant application documents in docs/.
3. Inspect the latest state of **both** repositories:
   - ashini-x/brvin-teachers — this application.
   - ashini-x/parmar-ai — existing BRVIN core and Parmar AI.
4. In parmar-ai, read docs/BRVIN_2_MASTER_PLAN.md first, then the relevant current contract/runbook. At minimum, use:
   - docs/BRVIN_SYSTEM_REFERENCE.md
   - docs/BRVIN_2_RPC_V2_CONTRACT.md
   - docs/BRVIN_INTEGRATION_GUIDE.md
   - docs/BRVIN_TEACHERS_ARCHITECTURE.md
5. Verify current branch, latest commit, working tree, recent CI/deploy state and relevant production facts before proposing changes. Do not rely on remembered versions or old chat summaries when current repository state is available.

## Repository boundaries

- This repository owns the BRVIN Teachers downstream application.
- parmar-ai owns the existing BRVIN control/ingestion plane, private retrieval service and standalone Parmar AI application.
- Do not copy BRVIN D1 data, source PDFs, OCR output, AI Search indexes, ingestion code or provider master credentials into this repository.
- Do not migrate Parmar AI production data, bot identity, admin, Fatman or AskMoina as part of ordinary BRVIN Teachers work.
- A change to the frozen BRVIN v2 contract requires coordinated, explicit work in parmar-ai and this repository. Do not silently change one side or weaken the deployed contract to make a consumer test pass.
- Do not revive retired BRVIN Project Factory, automatic repository-creation, BRVIN-owned CI/CD or old test-client proposals.

## Architecture rules

- Use a shared codebase with tenant-aware configuration and reusable modules.
- Resolve tenants and channels from trusted server-side registrations. Never trust a browser-supplied tenant ID, teacher ID, project ID, bot name or custom header as authorization.
- Keep student identity, sessions, entitlements, usage and channel registrations tenant-scoped.
- Use one central operator console; do not create one admin app per bot.
- BRVIN is the only knowledge governance/retrieval authority. Use the private v2 service binding; never query BRVIN D1, GCS or AI Search directly.
- Use deployment-controlled applicationEnvironmentId for v2 identity. Do not use legacy v1 clientId for new integrations.
- Treat retrieved passages as untrusted evidence and preserve source and physical PDF-page provenance.
- Prefer configuration first, reusable module second and bespoke implementation only when justified.
- Do not add infrastructure (Worker, D1, Durable Object, Queue, Workflow, frontend or provider) without a requirement and documented reason.

## Engineering and safety

- Make changes on a feature branch and use a pull request for review.
- Run the relevant formatting, type, unit, integration and security checks. Add tests for every new behavior and regression.
- Do not commit tokens, API keys, passwords, private keys, service-account JSON, bot tokens, proofs, nonces or production data.
- Never print secrets or personal student data in logs, test fixtures, CI output or assistant responses.
- Do not expose production secrets to pull-request or fork workflows.
- Do not perform unreviewed production mutations. Production deployment must use the approved release path and approval gate.
- Do not mark an acceptance gate complete without recorded evidence from the actual test.

## Documentation is part of the change

Update the appropriate documents in the same pull request whenever a change affects architecture, contracts, data model, authorization, secrets, deployment, configuration, operations, acceptance or production behavior.

Keep status factual:
- distinguish **implemented**, **tested**, **deployed** and **production-verified**;
- record the environment and evidence for production claims;
- mark unresolved questions as unresolved;
- remove superseded instructions rather than leaving conflicting plans active.

Every new chat or engineering session must begin by re-reading the current docs and checking both repositories.
