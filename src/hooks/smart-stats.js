const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Calculates character savings by comparing output length against
 * a hypothetical verbose response (estimated at 3.0x output length).
 * @param {string} inputText The input prompt (currently unused for direct multiplication).
 * @param {string} outputText The compressed output text.
 * @returns {number} The estimated character savings.
 */
function calculateSavings(inputText, outputText) {
  const actualLength = outputText ? outputText.length : 0;
  return Math.round(actualLength * 3.0 - actualLength);
}

/**
 * Gets the path where accumulated character savings are stored.
 * @returns {string} The resolved file path.
 */
function getSavingsPath() {
  const baseDir = process.env.CLAUDE_CONFIG_DIR || os.homedir();
  return path.resolve(baseDir, '.smart-stats-savings');
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
 * Reads, accumulates, and writes character savings securely.
 * Refuses to operate if either the savings file or its parent directory is a symlink.
 * @param {number} amount The character savings amount to add.
 * @returns {number} The new accumulated total savings.
 */
function updateSavings(amount) {
  const savingsFile = getSavingsPath();
  const parentDir = path.dirname(savingsFile);

  // Security Check: Target or parent cannot be a symlink
  if (isSymlink(savingsFile)) {
    throw new Error(`Security violation: Target path "${savingsFile}" is a symlink.`);
  }

  if (isSymlink(parentDir)) {
    throw new Error(`Security violation: Parent directory "${parentDir}" is a symlink.`);
  }

  let currentSavings = 0;
  if (fs.existsSync(savingsFile)) {
    const data = fs.readFileSync(savingsFile, 'utf8').trim();
    const parsed = parseInt(data, 10);
    if (!isNaN(parsed)) {
      currentSavings = parsed;
    }
  }

  const newSavings = currentSavings + amount;

  // Ensure parent directory exists
  fs.mkdirSync(parentDir, { recursive: true });

  // Write new accumulated savings back
  fs.writeFileSync(savingsFile, String(newSavings), 'utf8');

  return newSavings;
}

function getAccumulatedSavings() {
  const savingsFile = getSavingsPath();
  if (isSymlink(savingsFile)) {
    throw new Error(`Security violation: Target path "${savingsFile}" is a symlink.`);
  }
  let currentSavings = 0;
  if (fs.existsSync(savingsFile)) {
    const data = fs.readFileSync(savingsFile, 'utf8').trim();
    const parsed = parseInt(data, 10);
    if (!isNaN(parsed)) {
      currentSavings = parsed;
    }
  }
  return currentSavings;
}

function getLastParsedPath() {
  const baseDir = process.env.CLAUDE_CONFIG_DIR || os.homedir();
  return path.resolve(baseDir, '.smart-stats-last');
}

function findMostRecentJsonl(dir) {
  let mostRecentFile = null;
  let mostRecentTime = 0;

  function traverse(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (isSymlink(fullPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.jsonl')) {
        try {
          const stats = fs.statSync(fullPath);
          if (stats.mtimeMs > mostRecentTime) {
            mostRecentTime = stats.mtimeMs;
            mostRecentFile = fullPath;
          }
        } catch (e) {}
      }
    }
  }

  traverse(dir);
  return mostRecentFile;
}

function processMostRecentLog() {
  const configDir = process.env.CLAUDE_CONFIG_DIR;
  const projectsDir = configDir 
    ? path.join(configDir, 'projects') 
    : path.join(os.homedir(), '.claude', 'projects');

  if (!fs.existsSync(projectsDir)) {
    return {
      turns: 0,
      chars: 0,
      sessionSavings: 0,
      totalSavings: getAccumulatedSavings()
    };
  }

  const mostRecentFile = findMostRecentJsonl(projectsDir);
  if (!mostRecentFile) {
    return {
      turns: 0,
      chars: 0,
      sessionSavings: 0,
      totalSavings: getAccumulatedSavings()
    };
  }

  let totalCharCount = 0;
  let turnsCount = 0;
  try {
    const fileContent = fs.readFileSync(mostRecentFile, 'utf8');
    const lines = fileContent.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'assistant') {
          let outputText = '';
          if (obj.content) {
            if (typeof obj.content === 'string') {
              outputText = obj.content;
            } else if (Array.isArray(obj.content)) {
              outputText = obj.content
                .map(block => (typeof block === 'string' ? block : (block.text || '')))
                .join('');
            }
          } else if (obj.message && obj.message.content) {
            if (typeof obj.message.content === 'string') {
              outputText = obj.message.content;
            } else if (Array.isArray(obj.message.content)) {
              outputText = obj.message.content
                .map(block => (typeof block === 'string' ? block : (block.text || '')))
                .join('');
            }
          }

          if (outputText) {
            turnsCount++;
            totalCharCount += outputText.length;
          }
        }
      } catch (e) {}
    }
  } catch (err) {
    return {
      turns: 0,
      chars: 0,
      sessionSavings: 0,
      totalSavings: getAccumulatedSavings()
    };
  }

  const sessionSavings = calculateSavings('', 'a'.repeat(totalCharCount));

  const lastFile = getLastParsedPath();
  if (isSymlink(lastFile)) {
    throw new Error(`Security violation: Target path "${lastFile}" is a symlink.`);
  }

  let lastState = { filePath: '', charCount: 0 };
  if (fs.existsSync(lastFile)) {
    try {
      lastState = JSON.parse(fs.readFileSync(lastFile, 'utf8'));
    } catch (e) {}
  }

  let incrementalSavings = sessionSavings;
  if (lastState.filePath === mostRecentFile) {
    const lastSessionSavings = calculateSavings('', 'a'.repeat(lastState.charCount || 0));
    incrementalSavings = sessionSavings - lastSessionSavings;
    if (incrementalSavings < 0) {
      incrementalSavings = 0;
    }
  }

  let totalSavings = 0;
  if (incrementalSavings > 0) {
    totalSavings = updateSavings(incrementalSavings);
  } else {
    totalSavings = getAccumulatedSavings();
  }

  try {
    const parentDir = path.dirname(lastFile);
    if (!isSymlink(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
      fs.writeFileSync(lastFile, JSON.stringify({ filePath: mostRecentFile, charCount: totalCharCount }), 'utf8');
    }
  } catch (e) {}

  return {
    turns: turnsCount,
    chars: totalCharCount,
    sessionSavings: sessionSavings,
    totalSavings: totalSavings
  };
}

module.exports = {
  calculateSavings,
  updateSavings,
  processMostRecentLog
};
