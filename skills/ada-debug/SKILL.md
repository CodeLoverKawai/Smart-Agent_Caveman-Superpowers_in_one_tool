---
name: ada-debug
description: Use when investigating bugs, failures, or diagnosing issues.
---
# ada-debug

- Systematic loop:
  1. Reproduce: Write reproducing test or script.
  2. Observe: Gather logs, error output, or stack traces.
  3. Hypothesize: Formulate clear, falsifiable hypotheses.
  4. Test: Validate hypotheses via targeted tests or instrumentation.
  5. Fix: Write minimal patch to resolve issue.
- Verify resolution by running reproducing test again (must pass).
- No speculation/guesswork. Base changes only on evidence.
