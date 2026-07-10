const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const installPath = path.resolve(__dirname, '../bin/install.js');
const { stripJsoncComments, stripTrailingCommas } = require(installPath);

test('Installer & Verification', async (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ada-install-test-'));

  t.after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  await t.test('stripJsoncComments strips line and block comments from JSONC', () => {
    const raw = `
    // this is a line comment
    {
      "key": "value", /* inline block comment */
      "url": "https://example.com/api", // comment inside string like URL should not be stripped
      "nested": {
        "ok": true
      }
    }
    `;
    const cleaned = stripJsoncComments(raw);
    assert.doesNotMatch(cleaned, /this is a line comment/);
    assert.doesNotMatch(cleaned, /inline block comment/);
    const parsed = JSON.parse(stripTrailingCommas(cleaned));
    assert.strictEqual(parsed.key, 'value');
    assert.strictEqual(parsed.url, 'https://example.com/api');
    assert.strictEqual(parsed.nested.ok, true);
  });

  await t.test('installer creates settings.json if not present and configures correctly', () => {
    const env = {
      ...process.env,
      CLAUDE_CONFIG_DIR: tempDir
    };

    const res = spawnSync(process.execPath, [installPath], { env, encoding: 'utf8' });
    assert.strictEqual(res.status, 0);

    const settingsFile = path.join(tempDir, 'settings.json');
    assert.ok(fs.existsSync(settingsFile));

    const content = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));

    // Check status line configuration
    assert.ok(content.statusLine);
    assert.strictEqual(content.statusLine.type, 'command');
    assert.match(content.statusLine.command, /ada-statusline\.sh$/);

    // Check hooks configuration
    assert.ok(content.hooks);
    
    // SessionStart Hook
    assert.ok(content.hooks.SessionStart);
    assert.strictEqual(Array.isArray(content.hooks.SessionStart), true);
    assert.strictEqual(content.hooks.SessionStart.length, 1);
    assert.ok(content.hooks.SessionStart[0].hooks);
    assert.strictEqual(content.hooks.SessionStart[0].hooks[0].type, 'command');
    assert.match(content.hooks.SessionStart[0].hooks[0].command, /ada-activate\.js$/);

    // UserPromptSubmit Hook
    assert.ok(content.hooks.UserPromptSubmit);
    assert.strictEqual(Array.isArray(content.hooks.UserPromptSubmit), true);
    assert.strictEqual(content.hooks.UserPromptSubmit.length, 1);
    assert.ok(content.hooks.UserPromptSubmit[0].hooks);
    assert.strictEqual(content.hooks.UserPromptSubmit[0].hooks[0].type, 'command');
    assert.match(content.hooks.UserPromptSubmit[0].hooks[0].command, /ada-tracker\.js$/);

    // Verify ada-statusline.sh permissions were updated to 755
    const statuslinePath = path.resolve(__dirname, '../src/hooks/ada-statusline.sh');
    const stats = fs.statSync(statuslinePath);
    assert.strictEqual(stats.mode & 0o777, 0o755);
  });

  await t.test('installer is idempotent and does not duplicate hooks', () => {
    const env = {
      ...process.env,
      CLAUDE_CONFIG_DIR: tempDir
    };

    // Run first time
    let res = spawnSync(process.execPath, [installPath], { env, encoding: 'utf8' });
    assert.strictEqual(res.status, 0);

    const settingsFile = path.join(tempDir, 'settings.json');
    const initialContent = fs.readFileSync(settingsFile, 'utf8');

    // Run second time
    res = spawnSync(process.execPath, [installPath], { env, encoding: 'utf8' });
    assert.strictEqual(res.status, 0);

    const secondContent = fs.readFileSync(settingsFile, 'utf8');

    // Verify content didn't change and no duplicate hooks were added
    assert.strictEqual(initialContent, secondContent);

    const parsed = JSON.parse(secondContent);
    assert.strictEqual(parsed.hooks.SessionStart.length, 1);
    assert.strictEqual(parsed.hooks.SessionStart[0].hooks.length, 1);
    assert.strictEqual(parsed.hooks.UserPromptSubmit.length, 1);
    assert.strictEqual(parsed.hooks.UserPromptSubmit[0].hooks.length, 1);
  });

  await t.test('installer parses settings.json with comments and preserves/merges existing config', () => {
    const settingsFile = path.join(tempDir, 'settings.json');
    // Pre-create settings.json with JSONC comments and some existing settings/hooks
    const initialJSONC = `
    {
      // Existing setting
      "theme": "dark",
      "hooks": {
        "SessionStart": [
          {
            "hooks": [
              {
                "type": "command",
                "command": "echo 'Session starting...'"
              }
            ]
          }
        ]
      }
    }
    `;
    fs.writeFileSync(settingsFile, initialJSONC, 'utf8');

    const env = {
      ...process.env,
      CLAUDE_CONFIG_DIR: tempDir
    };

    const res = spawnSync(process.execPath, [installPath], { env, encoding: 'utf8' });
    assert.strictEqual(res.status, 0);

    const content = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));

    // Check existing settings are preserved
    assert.strictEqual(content.theme, 'dark');

    // Check statusLine is added
    assert.ok(content.statusLine);

    // Check SessionStart hook contains BOTH the existing hook and our new hook in correct structure
    assert.ok(content.hooks.SessionStart);
    assert.strictEqual(content.hooks.SessionStart.length, 1);
    const hooksList = content.hooks.SessionStart[0].hooks;
    assert.strictEqual(hooksList.length, 2);
    assert.strictEqual(hooksList[0].command, "echo 'Session starting...'");
    assert.match(hooksList[1].command, /ada-activate\.js$/);
  });
});
