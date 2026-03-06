const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'index.html');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');
const out = [];

let skipUntil = -1;  // line index (0-based) to skip until

for (let i = 0; i < lines.length; i++) {
  // If we're in a skip range, skip
  if (i <= skipUntil) continue;

  const line = lines[i];

  // Check for start of a duplicate block we want to remove
  // We want to keep the FIRST occurrence of each function
  // The duplicates start at 1-based lines 5851 and 5914
  // Convert to 0-based: 5850 and 5913
  // But let's do it by detecting the second + third occurrences of the function signature

  // Better approach: track how many times we've seen each function declaration
  if (line.trim() === 'function _initSessionCard() {' ||
      line.trim() === 'function _updateSessionCard() {') {
    // Count how many times we've already emitted this function
    const sig = line.trim();
    const emittedCount = out.filter(l => l.trim() === sig).length;
    if (emittedCount >= 1) {
      // This is a duplicate — find the closing } at top level and skip the whole function
      let depth = 0;
      let j = i;
      while (j < lines.length) {
        for (const ch of lines[j]) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        j++;
        if (depth <= 0) break;
      }
      skipUntil = j - 1;
      // Also skip the blank line after the closing brace if present
      if (j < lines.length && lines[j].trim() === '') skipUntil = j;
      continue;
    }
  }

  out.push(line);
}

const result = out.join('\n');
fs.writeFileSync(filePath, result, 'utf8');

// Verify
const check = result.match(/function _initSessionCard\(\)/g) || [];
const check2 = result.match(/function _updateSessionCard\(\)/g) || [];
const logPath = path.join(__dirname, '_dedup_result.txt');
fs.writeFileSync(logPath,
  '_initSessionCard count: ' + check.length + '\n' +
  '_updateSessionCard count: ' + check2.length + '\n' +
  'Lines removed: ' + (lines.length - out.length) + '\n',
  'utf8');
