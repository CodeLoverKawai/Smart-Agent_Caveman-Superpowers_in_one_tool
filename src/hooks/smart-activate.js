#!/usr/bin/env node

try {
  const fs = require('fs');
  const path = require('path');
  const { getDefaultMode, getFlagPath, safeWriteFlag } = require('./smart-config.js');

  const defaultMode = getDefaultMode();
  const flagPath = getFlagPath();

  // Writes the default mode to the flag path safely
  safeWriteFlag(flagPath, defaultMode);

  // Perform background update of .smart-stats-savings by parsing the most recent session JSONL file
  try {
    const { processMostRecentLog } = require('./smart-stats.js');
    processMostRecentLog();
  } catch (e) {
    // Silently ignore background stats update errors
  }

  // Locates skills/smart-agent/SKILL.md resolved relative to __dirname
  const skillPath = path.resolve(__dirname, '..', '..', 'skills', 'smart-agent', 'SKILL.md');
  if (fs.existsSync(skillPath)) {
    const content = fs.readFileSync(skillPath, 'utf8');
    // Emits the content of SKILL.md to stdout
    process.stdout.write(content);
  }
} catch (err) {
  // Silently swallow errors to prevent session crashes
}
