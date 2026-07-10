const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// We import the functions to test
const { getDefaultMode, getFlagPath, safeWriteFlag } = require('../src/hooks/ada-config.js');

test('ada-config getDefaultMode', (t) => {
  const originalEnv = process.env.ADA_DEFAULT_MODE;

  t.afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ADA_DEFAULT_MODE;
    } else {
      process.env.ADA_DEFAULT_MODE = originalEnv;
    }
  });

  // Test default mode fallback
  delete process.env.ADA_DEFAULT_MODE;
  assert.strictEqual(getDefaultMode(), 'full');

  // Test default mode from env variable
  process.env.ADA_DEFAULT_MODE = 'lite';
  assert.strictEqual(getDefaultMode(), 'lite');

  process.env.ADA_DEFAULT_MODE = 'ultra';
  assert.strictEqual(getDefaultMode(), 'ultra');
});

test('ada-config getFlagPath', (t) => {
  const originalConfigDir = process.env.CLAUDE_CONFIG_DIR;

  t.afterEach(() => {
    if (originalConfigDir === undefined) {
      delete process.env.CLAUDE_CONFIG_DIR;
    } else {
      process.env.CLAUDE_CONFIG_DIR = originalConfigDir;
    }
  });

  // Test when CLAUDE_CONFIG_DIR is set
  process.env.CLAUDE_CONFIG_DIR = '/custom/config/dir';
  assert.strictEqual(getFlagPath(), path.resolve('/custom/config/dir/.ada-agent-active'));

  // Test when CLAUDE_CONFIG_DIR is NOT set
  delete process.env.CLAUDE_CONFIG_DIR;
  const expectedPath = path.resolve(os.homedir(), '.ada-agent-active');
  assert.strictEqual(getFlagPath(), expectedPath);
});

test('ada-config safeWriteFlag', (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ada-agent-test-'));

  t.after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // Test Case 1: Write to a normal path
  const normalPath = path.join(tempDir, 'active-mode');
  safeWriteFlag(normalPath, 'full');
  assert.strictEqual(fs.readFileSync(normalPath, 'utf8'), 'full');

  // Test Case 2: Target path is a symlink
  const targetFile = path.join(tempDir, 'target-file');
  fs.writeFileSync(targetFile, 'original');
  const symlinkPath = path.join(tempDir, 'symlink-file');
  fs.symlinkSync(targetFile, symlinkPath);

  assert.throws(() => {
    safeWriteFlag(symlinkPath, 'new-value');
  }, /symlink/i);
  // Assert target file was NOT modified
  assert.strictEqual(fs.readFileSync(targetFile, 'utf8'), 'original');

  // Test Case 3: Parent directory of target is a symlink
  const realDir = path.join(tempDir, 'real-dir');
  fs.mkdirSync(realDir);
  const symlinkDir = path.join(tempDir, 'symlink-dir');
  fs.symlinkSync(realDir, symlinkDir);

  const fileInSymlinkDir = path.join(symlinkDir, 'some-file');
  assert.throws(() => {
    safeWriteFlag(fileInSymlinkDir, 'some-value');
  }, /symlink/i);
});
