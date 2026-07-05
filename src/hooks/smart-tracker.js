#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getDefaultMode, getFlagPath, safeWriteFlag } = require('./smart-config.js');

const flagPath = getFlagPath();

function readFlag(filePath) {
  try {
    const stats = fs.lstatSync(filePath);
    if (stats.isSymbolicLink() || !stats.isFile()) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8').trim().toLowerCase();
    if (['lite', 'full', 'ultra'].includes(content)) {
      return content;
    }
    return null;
  } catch (err) {
    return null;
  }
}

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    if (!input.trim()) {
      process.exit(0);
    }

    const data = JSON.parse(input);
    const prompt = (data.prompt || '').trim();
    const promptLower = prompt.toLowerCase();

    // 1. Checks if the prompt starts with a slash command /smart-agent or /smart
    if (/^\/(smart-agent|smart)(\s|$)/i.test(promptLower)) {
      const parts = prompt.split(/\s+/);
      const arg = (parts[1] || '').toLowerCase();

      if (arg === 'off') {
        // delete the flag file
        try { fs.unlinkSync(flagPath); } catch (e) {}
        process.stdout.write(JSON.stringify({
          decision: 'block',
          reason: 'Smart-agent deactivated.'
        }));
        return;
      } else if (['lite', 'full', 'ultra'].includes(arg)) {
        // update the active mode in the flag file safely
        safeWriteFlag(flagPath, arg);
        process.stdout.write(JSON.stringify({
          decision: 'block',
          reason: `Smart-agent mode updated to: ${arg}`
        }));
        return;
      } else if (arg === 'stats') {
        const { processMostRecentLog } = require('./smart-stats.js');
        let statsResult;
        try {
          statsResult = processMostRecentLog();
        } catch (err) {
          statsResult = { turns: 0, chars: 0, sessionSavings: 0, totalSavings: 0 };
        }
        process.stdout.write(JSON.stringify({
          decision: 'block',
          reason: `Smart-agent stats:\n- Session turns: ${statsResult.turns}\n- Output characters: ${statsResult.chars}\n- Total accumulated savings: ${statsResult.totalSavings}`
        }));
        return;
      } else if (!arg) {
        const activeMode = readFlag(flagPath);
        process.stdout.write(JSON.stringify({
          decision: 'block',
          reason: activeMode 
            ? `Smart-agent is active in mode: ${activeMode}`
            : 'Smart-agent is inactive.'
        }));
        return;
      } else {
        process.stdout.write(JSON.stringify({
          decision: 'block',
          reason: `Unknown smart-agent mode: ${parts[1]}. Use: /smart-agent [lite|full|ultra|off]`
        }));
        return;
      }
    }

    // 2. Checks natural language deactivation or activation phrases
    const stopRegex = /\b(stop|disable|deactivate|turn off)\b.*\bsmart-agent\b/i;
    const normalModeRegex = /\bnormal mode\b/i;
    const startRegex = /\b(activate|enable|turn on|start|use|talk like)\b.*\bsmart-agent\b/i;
    const talkLikeCavemanRegex = /\btalk like caveman\b/i;

    const deactivating = stopRegex.test(prompt) || normalModeRegex.test(prompt);
    const activating = startRegex.test(prompt) || talkLikeCavemanRegex.test(prompt);

    if (deactivating) {
      try { fs.unlinkSync(flagPath); } catch (e) {}
    } else if (activating) {
      const defaultMode = getDefaultMode();
      safeWriteFlag(flagPath, defaultMode);
    }

    // 3. If smart-agent is active, appends a tiny reminder tag or outputs reinforcement
    const activeMode = readFlag(flagPath);
    if (activeMode) {
      const mentionsClarityFiles = 
        promptLower.includes('implementation_plan.md') ||
        promptLower.includes('task.md') ||
        promptLower.includes('walkthrough.md') ||
        promptLower.includes('/specs/') ||
        promptLower.includes('docs/specs/');

      const additionalContext = mentionsClarityFiles
        ? `SMART-AGENT ACTIVE (mode: ${activeMode}). Target involves design/plan/task files. SUSPEND COMPRESSION for this turn. Respond in standard, clear language.`
        : `SMART-AGENT ACTIVE (mode: ${activeMode}). Keep responses concise, remove pleasantries, write code normally.`;

      data.hookSpecificOutput = {
        hookEventName: "UserPromptSubmit",
        additionalContext: additionalContext
      };
    }

    // Writes the JSON back to stdout
    process.stdout.write(JSON.stringify(data));
  } catch (err) {
    // Silently swallow errors
    try {
      process.stdout.write(input);
    } catch (e) {}
  }
});
