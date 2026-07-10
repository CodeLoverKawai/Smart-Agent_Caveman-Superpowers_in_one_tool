---
name: ada-proactive
description: Use when executing background tasks, automating workspace updates, or running scheduled loops.
---
# ada-proactive

- Proactive Loop & Task Rules:
  - Proactive tasks: Notice when workspace assets (docs, graphs, schemas) drift from code changes, and update them proactively.
  - Background processes: Deploy long-running compilations, tests, or servers to the background using async `run_command` instead of blocking.
  - Scheduled monitoring: Use `schedule` timer triggers to verify build statuses or poll external metrics without blocking active sessions.
  - Safety constraints: Always specify clear stopping rules, resource constraints, and cancellation metrics for background processes.
