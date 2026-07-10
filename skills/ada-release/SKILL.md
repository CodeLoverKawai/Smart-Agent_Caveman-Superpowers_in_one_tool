---
name: ada-release
description: Use when deploying applications, configuring CI/CD pipelines, or setting up release checks.
---
# ada-release

- Deployment & Release Rules:
  - Pipeline validation: Ensure all GitHub Actions, GitLab CI, or deploy configs run linters and test suites.
  - Release Checklist: Verify build output, check for uncommitted changes, execute dependencies audit, confirm environment secrets, and draft roll-back procedures.
  - Staging gate: Validate changes in a staging or dev environment before deploying to production.
  - Rollout strategy: Utilize feature flags or staged rollouts. Confirm live metrics/logs right after deployment.
