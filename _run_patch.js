const fs = require('fs');
const path = require('path');

const LOG = [];
const log = (...args) => { LOG.push(args.join(' ')); };

const filePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
let changeCount = 0;

// ── PATCH 1a: Restructure setInterval — move milestone inside if block ──
const OLD_INTERVAL = `setInterval(() => {
  if (_sessionActive && _sessionWkStart) {
    const s = Math.floor((Date.now() - _sessionWkStart) / 1000);
    const m = Math.floor(s / 60), sec = s % 60;
    document.getElementById('session-time').textContent =
      String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  }

  // Fire every 10 minutes
  const milestone = Math.floor(m / 10);`;

const NEW_INTERVAL_START = `setInterval(() => {
  if (_sessionActive && _sessionWkStart) {
    const s = Math.floor((Date.now() - _sessionWkStart) / 1000);
    const m = Math.floor(s / 60), sec = s % 60;
    document.getElementById('session-time').textContent =
      String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
    // Fire every 10 minutes
    const milestone = Math.floor(m / 10);`;

if (html.includes(OLD_INTERVAL)) {
  html = html.replace(OLD_INTERVAL, NEW_INTERVAL_START);
  changeCount++; log('OK Patch 1a');
} else {
  log('FAIL Patch 1a: OLD_INTERVAL not found');
  // debug: show nearby text
  const idx = html.indexOf('const milestone = Math.floor(m / 10);');
  log('  milestone line at:', idx);
}

// ── PATCH 1b: Fix indentation of toast block + add else branch ──
const OLD_TOAST_CLOSE = `    showToast(msg, 'var(--accent)');
    if (typeof sndMilestone === 'function') sndMilestone();
  }
}, 1000);`;

const NEW_TOAST_CLOSE = `    showToast(msg, 'var(--accent)');
      if (typeof sndMilestone === 'function') sndMilestone();
    }
    _updateSessionCard();
  } else {
    const s = Math.floor((Date.now() - sessionStart) / 1000);
    const m = Math.floor(s / 60), sec = s % 60;
    document.getElementById('session-time').textContent =
      String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  }
}, 1000);`;

if (html.includes(OLD_TOAST_CLOSE)) {
  html = html.replace(OLD_TOAST_CLOSE, NEW_TOAST_CLOSE);
  changeCount++; log('OK Patch 1b');
} else {
  log('FAIL Patch 1b: OLD_TOAST_CLOSE not found');
  const idx = html.indexOf('sndMilestone');
  log('  sndMilestone at:', idx);
  if (idx !== -1) log('  context:', JSON.stringify(html.slice(idx-50, idx+150)));
}

// ── PATCH 2: startWorkoutSession — add hero card control ──
const OLD_START = `  const pill = document.getElementById('session-pill');
  const dot  = document.getElementById('session-dot');
  if (pill) { pill.classList.add('session-active'); pill.title = 'Tap to end session'; }
  if (dot)  dot.classList.add('session-pulse');
  const endBtn = document.getElementById('session-end-btn');
  if (endBtn) endBtn.classList.add('visible');
  const isAr = (typeof currentLang !== 'undefined') && currentLang === 'ar';`;

const NEW_START = `  const pill = document.getElementById('session-pill');
  const dot  = document.getElementById('session-dot');
  if (pill) { pill.classList.add('session-active'); pill.title = 'Session in progress'; }
  if (dot)  dot.classList.add('session-pulse');
  const endBtn = document.getElementById('session-end-btn');
  if (endBtn) endBtn.classList.add('visible');
  // Hero card: switch to active state
  const hero   = document.getElementById('session-hero');
  const shIdle = document.getElementById('sh-idle');
  const shAct  = document.getElementById('sh-active');
  if (hero)   hero.classList.add('sh-is-active');
  if (shIdle) shIdle.style.display = 'none';
  if (shAct)  shAct.style.display  = '';
  _updateSessionCard();
  const isAr = (typeof currentLang !== 'undefined') && currentLang === 'ar';`;

if (html.includes(OLD_START)) {
  html = html.replace(OLD_START, NEW_START);
  changeCount++; log('OK Patch 2');
} else {
  log('FAIL Patch 2');
  const idx = html.indexOf("pill.classList.add('session-active')");
  if (idx !== -1) log('  context:', JSON.stringify(html.slice(idx-20, idx+200)));
}

// ── PATCH 3: endWorkoutSession — reset hero card ──
// Find unique anchor: the textContent = '...' line after removing session-active
// The emoji char before START may vary, so match around it
const OLD_END_A = `  if (pill) { pill.classList.remove('session-active'); pill.title = 'Tap to start session'; }
  if (dot)  dot.classList.remove('session-pulse');`;
const OLD_END_B_START = `  document.getElementById('session-time').textContent = '`;
// Find the full line ending after the quote
const endBIdx = html.indexOf(OLD_END_A);
if (endBIdx !== -1) {
  const afterA = html.indexOf(OLD_END_B_START, endBIdx);
  if (afterA !== -1) {
    const lineEnd = html.indexOf('\n', afterA);
    const fullLine = html.slice(afterA, lineEnd);
    log('  Found end pill reset line:', JSON.stringify(fullLine));
    const OLD_END_SECTION = OLD_END_A + '\n' + fullLine + '\n  const endBtn = document.getElementById(\'session-end-btn\');\n  if (endBtn) endBtn.classList.remove(\'visible\');\n  _showSessionSummary(duration);';
    const NEW_END_SECTION = `  if (pill) { pill.classList.remove('session-active'); pill.title = ''; }
  if (dot)  dot.classList.remove('session-pulse');
  const stEl = document.getElementById('session-time');
  if (stEl) stEl.textContent = '00:00';
  const endBtn = document.getElementById('session-end-btn');
  if (endBtn) endBtn.classList.remove('visible');
  // Hero card: switch back to idle
  const hero   = document.getElementById('session-hero');
  const shIdle = document.getElementById('sh-idle');
  const shAct  = document.getElementById('sh-active');
  if (hero)   hero.classList.remove('sh-is-active');
  if (shAct)  shAct.style.display  = 'none';
  if (shIdle) shIdle.style.display = '';
  _initSessionCard();
  _showSessionSummary(duration);`;
    if (html.includes(OLD_END_SECTION)) {
      html = html.replace(OLD_END_SECTION, NEW_END_SECTION);
      changeCount++; log('OK Patch 3');
    } else {
      log('FAIL Patch 3: full section not matched, trying substring...');
      log('  OLD_END_SECTION:', JSON.stringify(OLD_END_SECTION.slice(0,200)));
    }
  }
} else {
  log('FAIL Patch 3: pill.classList.remove not found');
}

// ── PATCH 4: Add _initSessionCard + _updateSessionCard before sessionPillTap ──
const ANCHOR = `function sessionPillTap() {
  if (_sessionActive) { endWorkoutSession(); } else { startWorkoutSession(); }
}`;

const HELPERS = `function _initSessionCard() {
  const idleDate = document.getElementById('sh-idle-date');
  const idleLast = document.getElementById('sh-idle-last');
  if (idleDate) {
    const now = new Date();
    idleDate.textContent = now.toLocaleDateString(undefined, {weekday:'short', day:'numeric', month:'short'});
  }
  if (idleLast) {
    const wkts = (typeof workouts !== 'undefined' ? workouts : []);
    const last  = wkts.length ? wkts[wkts.length - 1] : null;
    if (last) {
      const daysAgo = Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000);
      const ago = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : daysAgo + ' days ago';
      idleLast.textContent = 'Last: ' + ago + (last.muscle ? ' \u00b7 ' + last.muscle : '');
    } else {
      idleLast.textContent = 'No sessions yet \u2014 start strong! \uD83D\uDCAA';
    }
  }
  if (!_sessionActive) {
    const shIdle = document.getElementById('sh-idle');
    const shAct  = document.getElementById('sh-active');
    const hero   = document.getElementById('session-hero');
    if (shIdle) shIdle.style.display = '';
    if (shAct)  shAct.style.display  = 'none';
    if (hero)   hero.classList.remove('sh-is-active');
  }
}

function _updateSessionCard() {
  if (!_sessionActive) return;
  const bigTimer = document.getElementById('sh-timer-big');
  if (bigTimer && _sessionWkStart) {
    const s = Math.floor((Date.now() - _sessionWkStart) / 1000);
    const m = Math.floor(s / 60), sec = s % 60;
    bigTimer.textContent = String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  }
  const muscleEl = document.getElementById('sh-muscles-live');
  if (muscleEl) {
    if (_sessionWkMuscles.size > 0) {
      muscleEl.innerHTML = [..._sessionWkMuscles]
        .map(m => '<span class="sh-muscle-pill">' + m + '</span>')
        .join('');
    } else {
      muscleEl.innerHTML = '<span class="sh-muscle-pill sh-muscle-empty">select a muscle to begin</span>';
    }
  }
  const statsEl = document.getElementById('sh-stats-live');
  if (statsEl) {
    const exCount  = _sessionWkLogs.length;
    const setCount = _sessionWkLogs.reduce((a, l) => a + (l.sets ? l.sets.length : 0), 0);
    const volTotal = _sessionWkLogs.reduce((a, l) => a + (l.volume || 0), 0);
    const prCount  = _sessionWkLogs.filter(l => l.isPR).length;
    let line = exCount + (exCount !== 1 ? ' exercises' : ' exercise') + ' \u00b7 ' + setCount + ' sets';
    if (volTotal > 0) line += ' \u00b7 ' + Math.round(volTotal).toLocaleString() + ' kg';
    if (prCount  > 0) line += ' \u00b7 \u2B50 ' + prCount + ' PR' + (prCount > 1 ? 's' : '');
    statsEl.textContent = line;
  }
}

function sessionPillTap() {
  if (_sessionActive) { endWorkoutSession(); } else { startWorkoutSession(); }
}`;

if (html.includes(ANCHOR)) {
  html = html.replace(ANCHOR, HELPERS);
  changeCount++; log('OK Patch 4');
} else {
  log('FAIL Patch 4: sessionPillTap anchor not found');
}

// ── PATCH 5: switchView 'log' — add _initSessionCard() ──
const OLD_SV = `  if (name === 'log')       { setTimeout(_updateMuscleChipColors, 0); }`;
const NEW_SV = `  if (name === 'log')       { setTimeout(_updateMuscleChipColors, 0); _initSessionCard(); }`;
if (html.includes(OLD_SV)) {
  html = html.replace(OLD_SV, NEW_SV);
  changeCount++; log('OK Patch 5');
} else {
  log('FAIL Patch 5: switchView log line not found');
}

// ── PATCH 6: DOMContentLoaded — add _initSessionCard() ──
const OLD_DCL = `  if (typeof isDeloadActive === 'function' && isDeloadActive()) document.body.classList.add('deload-active');
});`;
const NEW_DCL = `  if (typeof isDeloadActive === 'function' && isDeloadActive()) document.body.classList.add('deload-active');
  setTimeout(_initSessionCard, 0);
});`;
if (html.includes(OLD_DCL)) {
  html = html.replace(OLD_DCL, NEW_DCL);
  changeCount++; log('OK Patch 6');
} else {
  log('FAIL Patch 6: DOMContentLoaded close not found');
}

// ── Save ──
fs.writeFileSync(filePath, html, 'utf8');

// Write log
const logPath = path.join(__dirname, '_patch_result.txt');
fs.writeFileSync(logPath, LOG.join('\n') + '\n\nTotal patches: ' + changeCount + '/6\n', 'utf8');
