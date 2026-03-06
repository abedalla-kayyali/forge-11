// Patch script: update session hero card JS
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
let changeCount = 0;

// ── PATCH 1: Fix setInterval — move milestone inside if block, add else for idle time, add _updateSessionCard call ──
const OLD_INTERVAL = `setInterval(() => {
  if (_sessionActive && _sessionWkStart) {
    const s = Math.floor((Date.now() - _sessionWkStart) / 1000);
    const m = Math.floor(s / 60), sec = s % 60;
    document.getElementById('session-time').textContent =
      String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  }

  // Fire every 10 minutes
  const milestone = Math.floor(m / 10);
  if (milestone > 0 && milestone !== _lastMilestoneMins) {
    _lastMilestoneMins = milestone;
    const mins = milestone * 10;
    const isAr = (typeof currentLang !== 'undefined') && currentLang === 'ar';
    const msg = isAr`;

const NEW_INTERVAL_START = `setInterval(() => {
  if (_sessionActive && _sessionWkStart) {
    const s = Math.floor((Date.now() - _sessionWkStart) / 1000);
    const m = Math.floor(s / 60), sec = s % 60;
    document.getElementById('session-time').textContent =
      String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
    // Fire every 10 minutes
    const milestone = Math.floor(m / 10);
    if (milestone > 0 && milestone !== _lastMilestoneMins) {
      _lastMilestoneMins = milestone;
      const mins = milestone * 10;
      const isAr = (typeof currentLang !== 'undefined') && currentLang === 'ar';
      const msg = isAr`;

if (html.includes(OLD_INTERVAL)) {
  html = html.replace(OLD_INTERVAL, NEW_INTERVAL_START);
  changeCount++;
  console.log('✅ Patch 1a: setInterval start restructured');
} else {
  console.log('❌ Patch 1a: OLD_INTERVAL not found');
}

// Now fix the closing of the interval — move the closing brace inside and add else branch
const OLD_INTERVAL_END = `      ? \`\${mins} `;
// We need to find the end of the toast block and }, 1000); and restructure
// Find the pattern: showToast + sndMilestone + close brace + }, 1000)
const OLD_END = `    showToast(msg, 'var(--accent)');
    if (typeof sndMilestone === 'function') sndMilestone();
  }
}, 1000);`;

const NEW_END = `    showToast(msg, 'var(--accent)');
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

if (html.includes(OLD_END)) {
  html = html.replace(OLD_END, NEW_END);
  changeCount++;
  console.log('✅ Patch 1b: setInterval end + else branch added');
} else {
  console.log('❌ Patch 1b: OLD_END not found');
}

// ── PATCH 2: Update startWorkoutSession() to control hero card ──
const OLD_START_FN = `function startWorkoutSession() {
  _sessionActive    = true;
  _sessionWkStart   = Date.now();
  _sessionWkLogs    = [];
  _sessionWkMuscles = new Set();
  _sessionShareText = '';
  const pill = document.getElementById('session-pill');
  const dot  = document.getElementById('session-dot');
  if (pill) { pill.classList.add('session-active'); pill.title = 'Tap to end session'; }
  if (dot)  dot.classList.add('session-pulse');
  const endBtn = document.getElementById('session-end-btn');
  if (endBtn) endBtn.classList.add('visible');
  const isAr = (typeof currentLang !== 'undefined') && currentLang === 'ar';`;

const NEW_START_FN = `function startWorkoutSession() {
  _sessionActive    = true;
  _sessionWkStart   = Date.now();
  _sessionWkLogs    = [];
  _sessionWkMuscles = new Set();
  _sessionShareText = '';
  // Header pill indicator
  const pill = document.getElementById('session-pill');
  const dot  = document.getElementById('session-dot');
  if (pill) { pill.classList.add('session-active'); pill.title = 'Session in progress'; }
  if (dot)  dot.classList.add('session-pulse');
  // Old end button (kept as secondary control when scrolled deep)
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

if (html.includes(OLD_START_FN)) {
  html = html.replace(OLD_START_FN, NEW_START_FN);
  changeCount++;
  console.log('✅ Patch 2: startWorkoutSession() updated');
} else {
  console.log('❌ Patch 2: OLD_START_FN not found');
}

// ── PATCH 3: Update endWorkoutSession() to reset hero card ──
const OLD_END_FN = `  if (pill) { pill.classList.remove('session-active'); pill.title = 'Tap to start session'; }
  if (dot)  dot.classList.remove('session-pulse');
  document.getElementById('session-time').textContent = '⏱ START';
  const endBtn = document.getElementById('session-end-btn');
  if (endBtn) endBtn.classList.remove('visible');
  _showSessionSummary(duration);`;

const NEW_END_FN = `  if (pill) { pill.classList.remove('session-active'); pill.title = ''; }
  if (dot)  dot.classList.remove('session-pulse');
  // Reset header pill timer to 00:00
  const st = document.getElementById('session-time');
  if (st) st.textContent = '00:00';
  // Old end button
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

if (html.includes(OLD_END_FN)) {
  html = html.replace(OLD_END_FN, NEW_END_FN);
  changeCount++;
  console.log('✅ Patch 3: endWorkoutSession() updated');
} else {
  console.log('❌ Patch 3: OLD_END_FN not found');
  // Try alternate (emoji may differ in file)
  const ALT_OLD = `  if (pill) { pill.classList.remove('session-active'); pill.title = 'Tap to start session'; }
  if (dot)  dot.classList.remove('session-pulse');
  document.getElementById('session-time').textContent = '`;
  const idx = html.indexOf(ALT_OLD);
  if (idx !== -1) {
    console.log('  Found alt anchor at index', idx);
    const lineStart = html.lastIndexOf('\n', idx) + 1;
    const snippet = html.slice(idx, idx + 300);
    console.log('  Snippet:', JSON.stringify(snippet.slice(0, 200)));
  }
}

// ── PATCH 4: Add _initSessionCard() and _updateSessionCard() before the existing session functions ──
const SESSION_FN_ANCHOR = `function sessionPillTap() {
  if (_sessionActive) { endWorkoutSession(); } else { startWorkoutSession(); }
}`;

const NEW_SESSION_HELPERS = `function _initSessionCard() {
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
      idleLast.textContent = 'Last: ' + ago + (last.muscle ? ' · ' + last.muscle : '');
    } else {
      idleLast.textContent = 'No sessions yet — start strong! 💪';
    }
  }
  // Ensure correct display state
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
  // Big timer
  const bigTimer = document.getElementById('sh-timer-big');
  if (bigTimer && _sessionWkStart) {
    const s = Math.floor((Date.now() - _sessionWkStart) / 1000);
    const m = Math.floor(s / 60), sec = s % 60;
    bigTimer.textContent = String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  }
  // Muscle pills
  const muscleEl = document.getElementById('sh-muscles-live');
  if (muscleEl) {
    if (_sessionWkMuscles.size > 0) {
      muscleEl.innerHTML = [..._sessionWkMuscles]
        .map(m => \`<span class="sh-muscle-pill">\${m}</span>\`)
        .join('');
    } else {
      muscleEl.innerHTML = '<span class="sh-muscle-pill sh-muscle-empty">select a muscle to begin</span>';
    }
  }
  // Stats line
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

if (html.includes(SESSION_FN_ANCHOR)) {
  html = html.replace(SESSION_FN_ANCHOR, NEW_SESSION_HELPERS);
  changeCount++;
  console.log('✅ Patch 4: _initSessionCard() + _updateSessionCard() added');
} else {
  console.log('❌ Patch 4: SESSION_FN_ANCHOR not found');
}

// ── PATCH 5: switchView 'log' handler — add _initSessionCard() call ──
const OLD_SWITCH_LOG = `  if (name === 'log')       { setTimeout(_updateMuscleChipColors, 0); }`;
const NEW_SWITCH_LOG = `  if (name === 'log')       { setTimeout(_updateMuscleChipColors, 0); _initSessionCard(); }`;

if (html.includes(OLD_SWITCH_LOG)) {
  html = html.replace(OLD_SWITCH_LOG, NEW_SWITCH_LOG);
  changeCount++;
  console.log('✅ Patch 5: switchView log handler updated');
} else {
  console.log('❌ Patch 5: switchView log line not found');
}

// ── PATCH 6: DOMContentLoaded — add _initSessionCard() call ──
const OLD_DCL = `document.addEventListener('DOMContentLoaded', () => {
  _hdrRestRender();
  _updateWaterGoal();
  _updateHdrWater();
  _updateHdrSteps();
  if (typeof isDeloadActive === 'function' && isDeloadActive()) document.body.classList.add('deload-active');
});`;

const NEW_DCL = `document.addEventListener('DOMContentLoaded', () => {
  _hdrRestRender();
  _updateWaterGoal();
  _updateHdrWater();
  _updateHdrSteps();
  if (typeof isDeloadActive === 'function' && isDeloadActive()) document.body.classList.add('deload-active');
  _initSessionCard();
});`;

if (html.includes(OLD_DCL)) {
  html = html.replace(OLD_DCL, NEW_DCL);
  changeCount++;
  console.log('✅ Patch 6: DOMContentLoaded updated');
} else {
  console.log('❌ Patch 6: DOMContentLoaded not found');
}

// ── Write result ──
if (changeCount > 0) {
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('\n✅ All ' + changeCount + ' patches applied and file saved.');
} else {
  console.log('\n⚠️  No patches applied.');
}
