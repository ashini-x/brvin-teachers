# Operations — Development, CI/CD and Production

**Status:** Bootstrap Worker deployed; GitHub Actions → Cloudflare deployment verified

The `brvin-teachers` Worker is deployed at `https://brvin-teachers.thenewtongs.workers.dev` with only a minimal `/health` and root status response. The GitHub Actions workflow uses the `production` environment and successfully deployed the Worker using the repository's Cloudflare API token and account ID variable. The application D1 database and BRVIN Service Binding are not yet configured. See [Cloudflare infrastructure status](INFRASTRUCTURE_STATUS.md).

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

GitHub is the source of truth. This repository is operated for autonomous coding and deployment: routine changes must not depend on a person manually approving each release.

1. The coding agent implements a scoped change, adds or updates tests, and synchronizes the relevant documentation.
2. The agent commits the completed change to `main` (or uses a feature branch and pull request when the change benefits from an isolated validation cycle).
3. Pull requests run validation only and receive no Cloudflare production credential.
4. A push to `main` runs the production validation job: clean dependency installation with `npm ci`, unit tests, production build and deployment dry-run.
5. Only after validation succeeds does the deploy job receive the narrowly scoped Cloudflare token through the GitHub `production` Environment, deploy the Worker and run the live health check.
6. The agent inspects the workflow result and records the deployed revision, Worker version and acceptance outcome.

The `production` Environment currently scopes access to deployment secrets; it is not intended to introduce a manual approval pause for normal autonomous releases. Do not add required human reviewers unless the operating policy is deliberately changed. Automated checks remain mandatory: failed tests, builds, dry-runs or smoke tests must block or fail the release.

Keep GitHub Actions permissions minimal. The default GITHUB_TOKEN should have only the repository permissions a workflow needs. Do not expose Cloudflare production credentials to pull_request jobs from forks or use unsafe pull_request_target patterns.

Do not configure both GitHub Actions and Cloudflare Workers Builds to independently auto-deploy the same Worker. GitHub Actions is the sole release authority for this repository. The [workflow](../.github/workflows/deploy.yml) validates pull requests without production credentials; pushes to `main` deploy only after the validation job succeeds. The original bootstrap deployment was verified in [run #3](https://github.com/ashini-x/brvin-teachers/actions/runs/42146322860); the lockfile-based pipeline is verified separately in the latest recorded run in [INFRASTRUCTURE_STATUS.md](INFRASTRUCTURE_STATUS.md).

## 3. Cloudflare tooling and resources

At implementation time, verify current Cloudflare tooling and the exact support for the required Service Binding and D1 migration workflow. Prefer the current recommended greenfield CLI when it supports the deployment requirements. If the project adopts an existing configuration/toolchain, keep one authoritative CLI/configuration path; do not install competing deployment tools or maintain duplicate configs.

Start with one runtime Worker and one application D1 database. Add Durable Objects, Queues, Workflows, additional Workers or custom domains only when a concrete pilot requirement justifies them. BRVIN's private Service Binding is a required integration dependency, not a reason to duplicate its storage/search infrastructure.

## 4. Deployment credentials

CI deployment is already configured and has passed an end-to-end smoke test. The token is stored in GitHub, not in this repository. Its confirmed scope should remain limited to the existing `brvin-teachers` Worker with Workers Editor. Do not broaden it for ordinary releases. The repository now commits `package-lock.json`, and both validation and deployment use `npm ci` to install the exact dependency tree from that lockfile. When intentionally adding or upgrading dependencies, use `npm install` in development to update both `package.json` and `package-lock.json`, review the diff, and commit both files together. CI must continue using `npm ci`.

If later changes require additional deployment capabilities:
- create a dedicated Cloudflare API token for this repository's deployment workflow;
- scope it to the correct account and only the required products/resources;
- do not use the Global API Key or a personal broad token;
- store the token as a GitHub Actions secret in a protected production Environment;
- store non-secret account identifiers as repository/environment variables where appropriate;
- keep required-reviewer gates disabled for routine unattended releases; introduce an approval gate only if the operating policy changes or a specific high-risk operation genuinely requires it;
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
