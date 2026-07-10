const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// We import the functions to test
const { calculateSavings, updateSavings } = require('../src/hooks/ada-stats.js');

test('ada-stats calculateSavings', () => {
  // Test case 1: Standard output text length calculation
  // Estimated verbose text length is outputText.length * 3.0
  // Savings is estimated verbose length minus actual outputText length.
  // E.g., for outputText of length 10: 10 * 3.0 - 10 = 20
  const input = "user prompt here";
  const output = "1234567890"; // length 10
  assert.strictEqual(calculateSavings(input, output), 20);

  // Test case 2: Empty output text
  assert.strictEqual(calculateSavings(input, ""), 0);

  // Test case 3: Arbitrary output text length
  const output2 = "a".repeat(100);
  assert.strictEqual(calculateSavings(input, output2), 200);
});

test('ada-stats updateSavings', (t) => {
  const originalConfigDir = process.env.CLAUDE_CONFIG_DIR;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ada-stats-test-'));

  t.afterEach(() => {
    if (originalConfigDir === undefined) {
      delete process.env.CLAUDE_CONFIG_DIR;
    } else {
      process.env.CLAUDE_CONFIG_DIR = originalConfigDir;
    }
  });

  t.after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // Setup temporary config directory
  process.env.CLAUDE_CONFIG_DIR = tempDir;
  const savingsFile = path.join(tempDir, '.ada-stats-savings');

  // Test Case 1: Initial write (file does not exist)
  const result1 = updateSavings(50);
  assert.strictEqual(result1, 50);
  assert.strictEqual(fs.readFileSync(savingsFile, 'utf8'), '50');

  // Test Case 2: Accumulate values
  const result2 = updateSavings(30);
  assert.strictEqual(result2, 80);
  assert.strictEqual(fs.readFileSync(savingsFile, 'utf8'), '80');

  // Test Case 3: Refuse to write/update if target file is a symlink
  const targetFile = path.join(tempDir, 'dummy-target');
  fs.writeFileSync(targetFile, '100');
  const symlinkFile = path.join(tempDir, 'symlink-savings');
  fs.symlinkSync(targetFile, symlinkFile);

  // Point CLAUDE_CONFIG_DIR to a directory where .ada-stats-savings would resolve to the symlink
  // We can test the security check by passing a symlink file path directly or setting up the environment.
  // Let's test the secure path validation: if the savings file is a symlink, it should throw.
  // We can temporarily swap process.env.CLAUDE_CONFIG_DIR to simulate this.
  const tempDirSymlink = fs.mkdtempSync(path.join(os.tmpdir(), 'ada-stats-symlink-test-'));
  const symlinkSavingsPath = path.join(tempDirSymlink, '.ada-stats-savings');
  fs.symlinkSync(targetFile, symlinkSavingsPath);

  process.env.CLAUDE_CONFIG_DIR = tempDirSymlink;
  assert.throws(() => {
    updateSavings(10);
  }, /symlink/i);

  fs.rmSync(tempDirSymlink, { recursive: true, force: true });
});
