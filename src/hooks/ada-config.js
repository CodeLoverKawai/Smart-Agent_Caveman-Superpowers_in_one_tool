const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Gets the default mode for the ada-agent.
 * @returns {string} The active default mode ("full" or environment variable value).
 */
function getDefaultMode() {
  return process.env.ADA_DEFAULT_MODE || 'full';
}

/**
 * Gets the path where the active mode configuration file is stored.
 * @returns {string} The resolved file path.
 */
function getFlagPath() {
  const baseDir = process.env.CLAUDE_CONFIG_DIR || os.homedir();
  return path.resolve(baseDir, '.ada-agent-active');
}

/**
 * Helper to check if a path is a symbolic link.
 * @param {string} p The path to check.
 * @returns {boolean} True if the path is a symbolic link, false otherwise.
 */
function isSymlink(p) {
  try {
    const stats = fs.lstatSync(p);
    return stats.isSymbolicLink();
  } catch (err) {
    return false;
  }
}

/**
 * Writes content to a file path safely, ensuring that neither the path
 * itself nor its direct parent directory is a symbolic link.
 * @param {string} filePath The path to write to.
 * @param {string} content The content to write.
 */
function safeWriteFlag(filePath, content) {
  const resolvedPath = path.resolve(filePath);
  const parentDir = path.dirname(resolvedPath);

  if (isSymlink(resolvedPath)) {
    throw new Error(`Refusing to write: Target path "${resolvedPath}" is a symlink.`);
  }

  if (isSymlink(parentDir)) {
    throw new Error(`Refusing to write: Parent directory "${parentDir}" is a symlink.`);
  }

  // Ensure parent directory exists
  fs.mkdirSync(parentDir, { recursive: true });

  // Write content safely
  fs.writeFileSync(resolvedPath, content, 'utf8');
}

module.exports = {
  getDefaultMode,
  getFlagPath,
  safeWriteFlag
};
