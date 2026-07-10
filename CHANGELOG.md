# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-07-10

### Added
- Second batch of advanced agent skills:
  - **ada-telemetry**: Observability, error monitoring (Sentry, OpenTelemetry), and distributed logs analysis.
  - **ada-release**: CI/CD pipeline automation, automated release checklists, staging gates, and deployment strategies.
  - **ada-db**: Database schema design (3NF/analytical schemas), reversible migration management, and execution plan optimization (EXPLAIN-driven).
  - **ada-proactive**: Background task offloading, scheduled monitoring timers, and proactive workspace asset updates.
  - **ada-hardware**: Low-level embedded C/C++ constraints (static allocation, minimal ISRs) and FPGA RTL synthesis/simulation guidelines.
- Skills registered in `GEMINI.md` and documented in `README.md`.

## [1.2.0] - 2026-07-10

### Added
- New advanced agent skills:
  - **ada-debug**: Systematic debugging loop (reproduce, observe, hypothesize, test, fix).
  - **ada-taste**: Frontend taste engineering and anti-slop visual design guidelines.
  - **ada-security**: Security checklists, safe symlink validation, and clarification gates.
  - **ada-mcp**: Rules for configuring and utilizing Model Context Protocol (MCP) servers and tools.
  - **ada-mem**: Rules for context token budget monitoring and session history summarization.
- New skills registered in `GEMINI.md` and documented in `README.md`.

## [1.1.0] - 2026-07-10

### Changed
- Project renamed from **Smart-Agent** to **Ada-Aider**.
- Main skill and plugin package renamed to **ada-agent** (matching the new project branding).
- All sub-skills renamed from `smart-*` (`smart-brainstorm`, `smart-plan`, `smart-code`, `smart-verify`, `smart-commit`, `smart-review`) to `ada-*` (`ada-brainstorm`, `ada-plan`, `ada-code`, `ada-verify`, `ada-commit`, `ada-review`).
- Hook files in `src/hooks/` renamed to use `ada-` prefix (`ada-activate.js`, `ada-config.js`, `ada-stats.js`, `ada-statusline.sh`, `ada-tracker.js`).
- Command triggers updated: slash commands `/smart` and `/smart-agent` are now `/ada` and `/ada-agent`.
- Statusline badge updated from `[SMART:MODE]` to `[ADA:MODE]`.
- Environment variable `SMART_DEFAULT_MODE` renamed to `ADA_DEFAULT_MODE`.
- Config flags and stats files renamed to `.ada-agent-active`, `.ada-stats-savings`, and `.ada-stats-last`.
- All documentation (including `README.md`, specs, and roadmap) and tests fully updated to reflect the new naming conventions.
