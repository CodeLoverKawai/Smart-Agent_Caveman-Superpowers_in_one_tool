---
name: ada-mcp
description: Use when integrating external Model Context Protocol (MCP) servers, tools, or resources.
---
# ada-mcp

- MCP Rules:
  - Leverage MCP tools for structural queries (database schemas, static code analysis, browser automation) before falling back to raw shell scripts.
  - Server setup: Declare required servers and settings in `~/.gemini/config/mcp_config.json`.
  - Tool mappings: Explicitly verify available tools in the session before executing them.
  - Error recovery: If an MCP tool execution fails, fall back gracefully to sandbox bash commands or inspect the server logs.
