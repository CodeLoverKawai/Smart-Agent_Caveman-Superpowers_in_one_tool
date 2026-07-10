---
name: ada-mem
description: Use when managing context budget, summarizing conversation history, or storing session summaries.
---
# ada-mem

- Context & Memory Rules:
  - Context gauge: Track session turn count. If turns > 10, prompt user to summarize and prune conversation.
  - Summarization: Parse `.jsonl` transcript logs to generate a high-density, 150-word snapshot containing:
    - Active project state
    - Solved files
    - Next steps checklist
  - Save session snapshots to `.ada-history-summary` to bootstrap fresh conversations.
  - Prune large outputs, binary traces, or redundant RAG logs before context window gets saturated.
