---
name: ada-security
description: Use when editing configuration files, dependencies, handling user inputs, or integrating external APIs.
---
# ada-security

- Security Guardrails:
  - Forbid hardcoded secrets, API keys, or default credentials. Utilize secure environment variables.
  - Path safety check: Ensure neither target files nor their parent directories are symbolic links (symlinks) before writing files.
  - Input Sanitization: Validate and sanitize all external/untrusted inputs to prevent command injection and prompt attacks.
  - Safe libraries: Pin dependencies to stable, audited versions.
- Clarification Gate: If user prompt is highly ambiguous or suggests unsafe configuration, halt execution and present a multi-choice question to clarify intent.
