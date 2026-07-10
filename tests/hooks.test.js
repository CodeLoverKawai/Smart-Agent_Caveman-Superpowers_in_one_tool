const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('child_process');

const activatePath = path.resolve(__dirname, '../src/hooks/ada-activate.js');
const trackerPath = path.resolve(__dirname, '../src/hooks/ada-tracker.js');
const statuslinePath = path.resolve(__dirname, '../src/hooks/ada-statusline.sh');

test('Hooks Integration', async (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ada-hooks-test-'));

  t.after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // Setup environment for the test execution
  const env = {
    ...process.env,
    CLAUDE_CONFIG_DIR: tempDir,
    ADA_DEFAULT_MODE: 'ultra',
  };

  const flagPath = path.join(tempDir, '.ada-agent-active');
  const savingsPath = path.join(tempDir, '.ada-stats-savings');

  await t.test('ada-activate.js writes default mode and prints SKILL.md', () => {
    // Delete any existing flag
    try { fs.unlinkSync(flagPath); } catch (e) {}

    const res = spawnSync(process.execPath, [activatePath], { env, encoding: 'utf8' });
    assert.strictEqual(res.status, 0);

    // Verify flag was written
    assert.strictEqual(fs.existsSync(flagPath), true);
    assert.strictEqual(fs.readFileSync(flagPath, 'utf8').trim(), 'ultra');

    // Verify stdout contains part of SKILL.md
    assert.match(res.stdout, /# ada-agent/);
  });

  await t.test('ada-tracker.js handles /ada-agent off', () => {
    // Write flag
    fs.writeFileSync(flagPath, 'ultra');

    const inputData = JSON.stringify({ prompt: '/ada-agent off' });
    const res = spawnSync(process.execPath, [trackerPath], {
      env,
      input: inputData,
      encoding: 'utf8'
    });

    assert.strictEqual(res.status, 0);
    // Verify flag was deleted
    assert.strictEqual(fs.existsSync(flagPath), false);

    // Verify output JSON blocks and returns reason
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.decision, 'block');
    assert.match(parsed.reason, /deactivated/i);
  });

  await t.test('ada-tracker.js handles /ada-agent lite', () => {
    // Write flag
    try { fs.unlinkSync(flagPath); } catch (e) {}

    const inputData = JSON.stringify({ prompt: '/ada-agent lite' });
    const res = spawnSync(process.execPath, [trackerPath], {
      env,
      input: inputData,
      encoding: 'utf8'
    });

    assert.strictEqual(res.status, 0);
    // Verify flag was written
    assert.strictEqual(fs.existsSync(flagPath), true);
    assert.strictEqual(fs.readFileSync(flagPath, 'utf8').trim(), 'lite');

    // Verify output JSON blocks and returns reason
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.decision, 'block');
    assert.match(parsed.reason, /updated to: lite/i);
  });

  await t.test('ada-tracker.js handles natural language activation & deactivation', () => {
    // Test activation
    try { fs.unlinkSync(flagPath); } catch (e) {}
    let inputData = JSON.stringify({ prompt: 'please use ada-agent' });
    let res = spawnSync(process.execPath, [trackerPath], {
      env,
      input: inputData,
      encoding: 'utf8'
    });
    assert.strictEqual(res.status, 0);
    assert.strictEqual(fs.readFileSync(flagPath, 'utf8').trim(), 'ultra');

    // Test deactivation
    inputData = JSON.stringify({ prompt: 'stop ada-agent please' });
    res = spawnSync(process.execPath, [trackerPath], {
      env,
      input: inputData,
      encoding: 'utf8'
    });
    assert.strictEqual(res.status, 0);
    assert.strictEqual(fs.existsSync(flagPath), false);
  });

  await t.test('ada-tracker.js appends reinforcement when active', () => {
    // Write flag
    fs.writeFileSync(flagPath, 'full');

    const inputData = JSON.stringify({ prompt: 'hello world' });
    const res = spawnSync(process.execPath, [trackerPath], {
      env,
      input: inputData,
      encoding: 'utf8'
    });

    assert.strictEqual(res.status, 0);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.prompt, 'hello world');
    assert.ok(parsed.hookSpecificOutput);
    assert.strictEqual(parsed.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
    assert.match(parsed.hookSpecificOutput.additionalContext, /ADA-AGENT ACTIVE \(mode: full\)/);
  });

  await t.test('ada-tracker.js handles /ada off alias', () => {
    // Write flag
    fs.writeFileSync(flagPath, 'ultra');
 
    const inputData = JSON.stringify({ prompt: '/ada off' });
    const res = spawnSync(process.execPath, [trackerPath], {
      env,
      input: inputData,
      encoding: 'utf8'
    });
 
    assert.strictEqual(res.status, 0);
    // Verify flag was deleted
    assert.strictEqual(fs.existsSync(flagPath), false);
 
    // Verify output JSON blocks and returns reason
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.decision, 'block');
    assert.match(parsed.reason, /deactivated/i);
  });

  await t.test('ada-tracker.js handles /ada lite alias', () => {
    // Write flag
    try { fs.unlinkSync(flagPath); } catch (e) {}
 
    const inputData = JSON.stringify({ prompt: '/ada lite' });
    const res = spawnSync(process.execPath, [trackerPath], {
      env,
      input: inputData,
      encoding: 'utf8'
    });
 
    assert.strictEqual(res.status, 0);
    // Verify flag was written
    assert.strictEqual(fs.existsSync(flagPath), true);
    assert.strictEqual(fs.readFileSync(flagPath, 'utf8').trim(), 'lite');
 
    // Verify output JSON blocks and returns reason
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.decision, 'block');
    assert.match(parsed.reason, /updated to: lite/i);
  });

  await t.test('ada-tracker.js suspends compression on implementation_plan.md', () => {
    fs.writeFileSync(flagPath, 'full');

    const inputData = JSON.stringify({ prompt: 'Please update implementation_plan.md with the new design' });
    const res = spawnSync(process.execPath, [trackerPath], {
      env,
      input: inputData,
      encoding: 'utf8'
    });

    assert.strictEqual(res.status, 0);
    const parsed = JSON.parse(res.stdout);
    assert.ok(parsed.hookSpecificOutput);
    assert.match(parsed.hookSpecificOutput.additionalContext, /SUSPEND COMPRESSION/);
    assert.match(parsed.hookSpecificOutput.additionalContext, /Target involves design\/plan\/task files/);
  });

  await t.test('ada-tracker.js handles /ada stats and parses jsonl', () => {
    // Clear any previous savings file or last-parsed file
    try { fs.unlinkSync(savingsPath); } catch (e) {}
    const lastParsedPath = path.join(tempDir, '.ada-stats-last');
    try { fs.unlinkSync(lastParsedPath); } catch (e) {}
 
    const projDir = path.join(tempDir, 'projects', 'test-project');
    fs.mkdirSync(projDir, { recursive: true });
    
    const jsonlContent = [
      JSON.stringify({ type: 'user', content: 'hello' }),
      JSON.stringify({ type: 'assistant', content: 'Hi there! This is a test turn.' }), // 30 chars
      JSON.stringify({ type: 'user', content: 'cool' }),
      JSON.stringify({ type: 'assistant', message: { content: 'Indeed it is.' } }), // 13 chars
    ].join('\n') + '\n';
    
    fs.writeFileSync(path.join(projDir, 'session-123.jsonl'), jsonlContent, 'utf8');
 
    const inputData = JSON.stringify({ prompt: '/ada stats' });
    const res = spawnSync(process.execPath, [trackerPath], {
      env,
      input: inputData,
      encoding: 'utf8'
    });
 
    assert.strictEqual(res.status, 0);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.decision, 'block');
    assert.match(parsed.reason, /Session turns: 2/);
    assert.match(parsed.reason, /Output characters: 43/);
    assert.match(parsed.reason, /Total accumulated savings: 86/);
  });

  await t.test('ada-activate.js performs background stats update on SessionStart', () => {
    // Clear savings file and last-parsed file
    try { fs.unlinkSync(savingsPath); } catch (e) {}
    const lastParsedPath = path.join(tempDir, '.ada-stats-last');
    try { fs.unlinkSync(lastParsedPath); } catch (e) {}

    // Run activate hook
    const res = spawnSync(process.execPath, [activatePath], { env, encoding: 'utf8' });
    assert.strictEqual(res.status, 0);

    // Verify savings was written automatically
    assert.strictEqual(fs.existsSync(savingsPath), true);
    assert.strictEqual(fs.readFileSync(savingsPath, 'utf8').trim(), '86');
  });

  await t.test('ada-statusline.sh outputs colored badge and savings', () => {
    // 1. Inactive case
    try { fs.unlinkSync(flagPath); } catch (e) {}
    try { fs.unlinkSync(savingsPath); } catch (e) {}
 
    let res = spawnSync('bash', [statuslinePath], { env, encoding: 'utf8' });
    assert.strictEqual(res.status, 0);
    assert.strictEqual(res.stdout, '');
 
    // 2. Active case without savings
    fs.writeFileSync(flagPath, 'lite');
    res = spawnSync('bash', [statuslinePath], { env, encoding: 'utf8' });
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /\[ADA:LITE\]/);
    assert.doesNotMatch(res.stdout, /⛏/);
 
    // 3. Active case with small savings
    fs.writeFileSync(savingsPath, '350');
    res = spawnSync('bash', [statuslinePath], { env, encoding: 'utf8' });
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /\[ADA:LITE\]/);
    assert.match(res.stdout, /⛏ 350/);
 
    // 4. Active case with large savings
    fs.writeFileSync(savingsPath, '12400');
    res = spawnSync('bash', [statuslinePath], { env, encoding: 'utf8' });
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /\[ADA:LITE\]/);
    assert.match(res.stdout, /⛏ 12.4k/);
  });
});
