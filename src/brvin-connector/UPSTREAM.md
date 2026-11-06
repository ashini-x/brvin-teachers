# Vendored BRVIN connector source pin

This directory contains a reviewed, local copy of `@brvin/connector` from the BRVIN Core repository.

- Upstream repository: https://github.com/ashini-x/parmar-ai
- Immutable upstream commit: `91b6a499bd782ae298b41e790157c23682f10881`
- Upstream package path: `packages/brvin-connector/`
- Upstream package README blob: `e99d0c4eab3f5e6b9ee4423f25e7af9aa9ef308c`
- Upstream package.json blob: `36c6a6305875eb7b7b59543ae02fad052834c259`
- Upstream source blob: `3489566761595fabe6a30f685ae7da34191540d0`

The package is intentionally not installed from a public npm registry. Updates must be copied from a reviewed immutable Core commit through a separate consumer change, with the pin and tests updated together.

The v2 connector handles bounded inputs, deadlines, response-size limits, structured failure results, content-free diagnostics, citations, and no automatic retries. The consumer continues to own tenant authorization, the content-free connection probe, student authentication, model orchestration, and final answer delivery.
