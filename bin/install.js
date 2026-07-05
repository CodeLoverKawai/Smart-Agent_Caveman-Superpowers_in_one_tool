#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Helper to strip JSONC comments (both block /* ... */ and line // ... comments)
// while keeping string values intact.
function stripJsoncComments(jsonc) {
  return jsonc.replace(/("([^"\\]|\\.)*")|(\/\*[\s\S]*?\*\/|\/\/.*)/g, (match, p1) => {
    if (p1 !== undefined) {
      return p1;
    }
    return '';
  });
}

// Helper to strip trailing commas in arrays/objects so JSON.parse won't throw
function stripTrailingCommas(json) {
  return json.replace(/,\s*([\]}])/g, '$1');
}

// Validates that hook arrays conform to Claude Code's structure:
// settings.hooks[eventName] = [ { hooks: [ { type: 'command', command: '...' } ] } ]
// and injects the given command idempotently.
function validateAndInjectHook(settings, eventName, command) {
  if (!settings.hooks || typeof settings.hooks !== 'object') {
    settings.hooks = {};
  }

  let list = settings.hooks[eventName];
  if (!Array.isArray(list)) {
    list = [];
    settings.hooks[eventName] = list;
  }

  // Normalize existing elements to conform to the required structure
  const cleanedList = [];
  for (const item of list) {
    if (item && typeof item === 'object' && Array.isArray(item.hooks)) {
      const cleanedHooks = [];
      for (const h of item.hooks) {
        if (h && typeof h === 'object' && typeof h.command === 'string') {
          cleanedHooks.push({
            type: h.type || 'command',
            command: h.command
          });
        }
      }
      cleanedList.push({ hooks: cleanedHooks });
    }
  }

  settings.hooks[eventName] = cleanedList;

  // Check if our command already exists in any of the hooks arrays
  let exists = false;
  for (const item of cleanedList) {
    for (const h of item.hooks) {
      if (h.type === 'command' && h.command === command) {
        exists = true;
        break;
      }
    }
    if (exists) break;
  }

  // Inject command if it does not exist
  if (!exists) {
    if (cleanedList.length === 0) {
      cleanedList.push({
        hooks: [
          {
            type: 'command',
            command: command
          }
        ]
      });
    } else {
      cleanedList[0].hooks.push({
        type: 'command',
        command: command
      });
    }
  }
}

function runInstaller() {
  const configDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  const settingsPath = path.join(configDir, 'settings.json');

  // Resolve absolute paths for the hook scripts
  const activatePath = path.resolve(__dirname, '../src/hooks/smart-activate.js');
  const trackerPath = path.resolve(__dirname, '../src/hooks/smart-tracker.js');
  const statuslinePath = path.resolve(__dirname, '../src/hooks/smart-statusline.sh');

  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      const rawContent = fs.readFileSync(settingsPath, 'utf8');
      const strippedComments = stripJsoncComments(rawContent);
      const cleanJson = stripTrailingCommas(strippedComments);
      if (cleanJson.trim() !== '') {
        settings = JSON.parse(cleanJson);
      }
    } catch (err) {
      console.error(`Warning: Failed to parse settings.json from ${settingsPath}: ${err.message}`);
      // Start with empty settings if corrupt
    }
  }

  // Inject SessionStart hook
  validateAndInjectHook(settings, 'SessionStart', `node ${activatePath}`);

  // Inject UserPromptSubmit hook
  validateAndInjectHook(settings, 'UserPromptSubmit', `node ${trackerPath}`);

  // Inject statusLine config if not already configured
  if (!settings.statusLine || typeof settings.statusLine !== 'object' || !settings.statusLine.command) {
    settings.statusLine = {
      type: 'command',
      command: `bash ${statuslinePath}`
    };
  }

  // Atomically write back the settings file
  fs.mkdirSync(configDir, { recursive: true });
  const tempPath = settingsPath + '.tmp';
  fs.writeFileSync(tempPath, JSON.stringify(settings, null, 2), 'utf8');
  fs.renameSync(tempPath, settingsPath);

  // Set executable permissions on smart-statusline.sh (chmod 755)
  if (fs.existsSync(statuslinePath)) {
    try {
      fs.chmodSync(statuslinePath, 0o755);
    } catch (err) {
      console.error(`Warning: Failed to chmod 755 smart-statusline.sh: ${err.message}`);
    }
  } else {
    console.error(`Warning: smart-statusline.sh not found at ${statuslinePath}`);
  }

  console.log(`Successfully configured smart-agent hooks and statusline in: ${settingsPath}`);
}

// Execute when run directly
if (require.main === module) {
  runInstaller();
}

module.exports = {
  stripJsoncComments,
  stripTrailingCommas,
  validateAndInjectHook,
  runInstaller
};
