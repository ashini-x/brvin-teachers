# Operations — Development, CI/CD and Production

**Status:** Operating standard; no deployment resources configured yet

This document describes the intended operating model. It does not claim that a Worker, D1 database, GitHub Actions workflow, Cloudflare token or production environment currently exists.

## 1. Environments

Keep local development, preview/staging and production separated. Use environment-specific:
- Worker configuration and bindings;
- D1 database and migration target;
- BRVIN application environment identity;
- model/provider credentials;
- channel/bot credentials;
- access policies and logging.

Do not point preview builds at production data or production BRVIN identity by default. Never use production credentials in fork-originated pull requests.

## 2. Source control and CI

Use GitHub as the source of truth. The expected flow is:

1. Create a feature branch.
2. Implement the change with tests and documentation.
3. Open a pull request.
4. Run formatting, typecheck, unit, integration and security checks.
5. Review the diff and test evidence.
6. Merge through the protected main branch.
7. Deploy production only through the approved GitHub Actions environment and approval gate.
8. Run health, application and private BRVIN smoke tests.
9. Record the deployed revision, Worker version and acceptance outcome.

Keep GitHub Actions permissions minimal. The default GITHUB_TOKEN should have only the repository permissions a workflow needs. Do not expose Cloudflare production credentials to pull_request jobs from forks or use unsafe pull_request_target patterns.

Do not configure both GitHub Actions and Cloudflare Workers Builds to independently auto-deploy the same Worker. Choose one release authority; the initial recommendation is GitHub Actions because it can enforce the repository's full test and approval gates.

## 3. Cloudflare tooling and resources

At implementation time, verify current Cloudflare tooling and the exact support for the required Service Binding and D1 migration workflow. Prefer the current recommended greenfield CLI when it supports the deployment requirements. If the project adopts an existing configuration/toolchain, keep one authoritative CLI/configuration path; do not install competing deployment tools or maintain duplicate configs.

Start with one runtime Worker and one application D1 database. Add Durable Objects, Queues, Workflows, additional Workers or custom domains only when a concrete pilot requirement justifies them. BRVIN's private Service Binding is a required integration dependency, not a reason to duplicate its storage/search infrastructure.

## 4. Deployment credentials

When CI deployment is ready:
- create a dedicated Cloudflare API token for this repository's deployment workflow;
- scope it to the correct account and only the required products/resources;
- do not use the Global API Key or a personal broad token;
- store the token as a GitHub Actions secret in a protected production Environment;
- store non-secret account identifiers as repository/environment variables where appropriate;
- require approval before production environment secrets are released to deployment jobs;
- grant D1 migration permissions only if a workflow actually applies remote D1 migrations;
- add custom-domain route permissions only if a custom route is configured;
- do not permanently grant broad account administration to routine deployment automation.

Initial creation of a new Worker/resource may require a temporary bootstrap permission different from routine deployment. Reduce or remove bootstrap privileges after setup. Verify exact permission names and resource scopes against the current Cloudflare dashboard/API before creating a token.

No token should be pasted into ChatGPT or committed to this repository. Use secure provider UI flows and repository/environment secrets.

## 5. Runtime observability

Use structured logs with a request/correlation ID and normalized error codes. Capture enough metadata to answer:
- which environment and channel received the request;
- which tenant-scoped operation ran;
- whether BRVIN/provider calls succeeded or failed;
- request timing and usage/cost counters;
- whether retry, throttling or fallback policy was applied.

Do not log secrets, tokens, cookies, raw proof/nonces, full private source passages or unnecessary personal student data. Add alerts only for actionable conditions such as elevated errors, failed deployments, queue backlog or exhausted quotas.

## 6. Health and smoke tests

A production release should verify:
- runtime health route and expected build/version marker;
- selected channel webhook/verification path;
- authenticated tenant resolution and a normal student flow;
- tenant isolation negative checks;
- private BRVIN_SERVICE connectivity and v2 method behavior;
- useful evidence from a real approved project;
- grant-revocation denial;
- provider failure and BRVIN failure safe behavior;
- no public route to brvin-service.

A successful deployment response or HTTP 200 alone is not acceptance.

## 7. Recovery and rollback

Before first production release, define:
- previous known-good Worker version and rollback command/path;
- compatibility rules for D1 schema changes;
- how to disable a tenant or channel without affecting others;
- credential rotation and emergency revocation;
- BRVIN binding/identity recovery steps;
- data backup and restore expectations;
- incident communication and audit procedure.

Prefer backward-compatible expand/contract migrations. Do not delete or rename production fields in the same release that first stops using them unless rollback behavior is explicitly safe.

If a deployment fails, stop promotion, preserve logs without secrets, inspect the exact version/configuration, and roll back through the approved deployment authority. Never edit production D1 rows merely to make a health check pass.

## 8. Operational status record

For each production release, record in the pull request or release note:
- source commit;
- CI workflow and result;
- target environment;
- deployed Worker version/ID;
- migration identifier and outcome;
- smoke test results;
- BRVIN connection/retrieval/revocation checks as applicable;
- known issues and rollback reference.

Keep README.md, docs/DEVELOPMENT_PLAN.md and relevant runbooks synchronized when status changes.
