# Future Roadmap: Ada-Aider Unified Skills System

Date: 2026-07-02

Here are the planned future integrations to enhance the capabilities, context efficiency, and developer experience of the `ada-agent` unified skills system:

---

## 1. Context Window Gauge (Real-Time HUD)
- **Goal**: Show active token usage directly in the terminal statusline so the developer knows when the context buffer is getting full.
- **Tasks**:
  - Extend `ada-statusline.sh` to read the active conversation's total size.
  - Render a gauge indicator like `[ADA:FULL] [Ctx: 24k/200k]`.
  - Alert the user with a warning if the context window exceeds 80% capacity.

---

## 2. Dynamic Context Pruning (/ada compress)
- **Goal**: Automatically clean up and summarize the active chat history to free up context tokens during long development cycles.
- **Tasks**:
  - Implement a `/ada compress` command in `ada-tracker.js`.
  - Parse the current session's `.jsonl` transcript and call Gemini/Claude to generate a 150-200 word summary containing the project state, resolved files, and active plan checklists.
  - Save this summary to `.ada-history-summary` and advise the user to start a fresh thread using that summary as the bootstrap context.

---

## 3. Semantic loading of Skills
- **Goal**: Only inject relevant skill instructions into the prompt context on demand, keeping the baseline token overhead near zero.
- **Tasks**:
  - Modify `ada-tracker.js` to run a local keyword match on the user's prompt text.
  - Dynamically load and append *only* the specific active sub-skill (e.g. only the TDD section of `ada-code` if the prompt mentions testing or debugging, or only `ada-plan` if the prompt mentions task updates).

---

## 4. MCP Dependency Mapping Integration
- **Goal**: Empower the planning phase (`ada-plan`) to perform precise cross-file dependency analysis without having to read the entire codebase.
- **Tasks**:
  - Configure an MCP server that parses project imports.
  - When the agent generates `implementation_plan.md`, call the MCP tool to automatically map out which files depend on the modified paths.
  - Warn the agent about potential side-effects or breaking changes in downstream files.

---

## 5. Ada-Crew Sub-Agent Orchestration
- **Goal**: Leverage surgical sub-agents (like read-only investigators, file-specific builders, and diff reviewers) communicating via compact payloads to completely offload file-reading overhead from the main conversation thread.
- **Tasks**:
  - Integrate a sub-agent orchestrator directly into `ada-code`.
  - Automatically delegate file edits to a dedicated builder sub-agent and verify the changes with a reviewer sub-agent.
  - Receive only a 1-line verification confirmation on the main thread, keeping the main context window entirely clean.
