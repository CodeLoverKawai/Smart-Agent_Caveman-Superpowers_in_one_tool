---
name: ada-telemetry
description: Use when setting up observability, instrumenting error monitoring, or resolving logs and alerts.
---
# ada-telemetry

- Observability Rules:
  - Logging standard: Avoid empty catch blocks. Always log structured context and trace IDs.
  - Error monitoring: Setup Sentry or OpenTelemetry instrumentation based on platform standards.
  - LLM tracing: Monitor model requests/responses including latency, prompt/completion token count, and cost telemetry.
  - Diagnostic flow: Map stack traces to source files. Review raw distributed logs and trace graphs before fixing bugs.
