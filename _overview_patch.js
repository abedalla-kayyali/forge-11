/**
 * FORGE Stats Overview Patch
 * 1. Fix stat cards to use period-filtered _pw instead of all-time workouts
 * 2. Fix heatmap to always use workouts (recovery view, not period view)
 * 3. Add Quick Snapshot bar (streak, last session, PRs, volume trend)
 * 4. Add period label to stat cards
 */

const fs = require('fs');
const path = 'C:/Users/USER/Desktop/Claude/Forg OS Gym V3 - Working version/index.html';

let content = fs.readFileSync(path, 'utf8');
const originalLength = content.length;
let patchCount = 0;
const log = [];

function replace(desc, oldStr, newStr) {
  if (!content.includes(oldStr)) {
    log.push('MISS [' + desc + '] — anchor not found');
    return false;
  }
  const count = content.split(oldStr).length - 1;
  if (count > 1) {
    log.push('AMBIG [' + desc + '] — ' + count + ' matches, using first');
  }
  content = content.replace(oldStr, newStr);
  patchCount++;
  log.push('OK [' + desc + ']');
  return true;
}

// ===========================================================================
// PATCH 1: Fix renderDashboard() — move _pw to top, use for stat cards
// Replace:
//   const totalVol  = workouts.reduce((a,w) => a + w.totalVolume, 0);
//   const totalSets = workouts.reduce((a,w) => a + w.sets.length, 0);
// With: compute _pw first, use _pw for vol/sessions/sets
// ===========================================================================
replace(
  'Fix stat cards: move _pw to top + use period-filtered data',
  `  const totalVol  = workouts.reduce((a,w) => a + w.totalVolume, 0);
  const totalSets = workouts.reduce((a,w) => a + w.sets.length, 0);`,
  `  // Period-filtered workouts — computed once, used for all stat cards + charts
  const _pw = _filterWorkoutsByPeriod(workouts, _dashPeriod);
  const _periodLabel = _dashPeriod === 'ALL' ? 'All time'
    : _dashPeriod === '7D'  ? 'Last 7 days'
    : _dashPeriod === '1M'  ? 'Last 30 days'
    : _dashPeriod === '3M'  ? 'Last 3 months'
    : 'Last 6 months';
  const totalVol  = _pw.reduce((a,w) => a + (w.totalVolume||0), 0);
  const totalSets = _pw.reduce((a,w) => a + (w.sets||[]).length, 0);`
);

// PATCH 2: Fix sessions count to use _pw.length (not workouts.length)
replace(
  'Fix sessions stat to use _pw.length',
  `  document.getElementById('dash-sessions').textContent = workouts.length;`,
  `  document.getElementById('dash-sessions').textContent = _pw.length;`
);

// PATCH 3: After the PR exercise line, add period label + volume delta
// We find the line:  document.getElementById('dash-sets').textContent     = totalSets;
// and add the new code after it
replace(
  'Add period label + vol delta after stat card updates',
  `  document.getElementById('dash-sets').textContent     = totalSets;`,
  `  document.getElementById('dash-sets').textContent     = totalSets;

  // Update "All time" labels on period-sensitive stat cards
  const _statDeltas = document.querySelectorAll('#view-dashboard .stats-bar .stat-delta[data-i18n="dash.allTime"]');
  _statDeltas.forEach(el => { el.textContent = _periodLabel; });

  // Volume delta vs previous period
  const _volDeltaEl = document.getElementById('dash-vol-delta');
  if (_volDeltaEl) {
    if (_dashPeriod === 'ALL') {
      _volDeltaEl.textContent = 'All time';
      _volDeltaEl.className = 'stat-delta neutral';
    } else {
      const _days = _dashPeriod === '7D' ? 7 : _dashPeriod === '1M' ? 30 : _dashPeriod === '3M' ? 90 : 180;
      const _prevEnd = new Date(); _prevEnd.setDate(_prevEnd.getDate() - _days);
      const _prevStart = new Date(_prevEnd); _prevStart.setDate(_prevStart.getDate() - _days);
      const _prevPw = workouts.filter(w => {
        const d = (w.date || '').slice(0, 10);
        return d >= _prevStart.toISOString().slice(0, 10) && d < _prevEnd.toISOString().slice(0, 10);
      });
      const _prevVol = _prevPw.reduce((a,w) => a + (w.totalVolume||0), 0);
      if (_prevVol > 0) {
        const _delta = Math.round(((totalVol - _prevVol) / _prevVol) * 100);
        const _sign = _delta >= 0 ? '+' : '';
        _volDeltaEl.textContent = _sign + _delta + '% vs prev';
        _volDeltaEl.className = 'stat-delta ' + (_delta >= 0 ? 'up' : 'down');
      } else if (totalVol > 0) {
        _volDeltaEl.textContent = 'First period';
        _volDeltaEl.className = 'stat-delta neutral';
      } else {
        _volDeltaEl.textContent = '\u2014';
        _volDeltaEl.className = 'stat-delta neutral';
      }
    }
  }`
);

// PATCH 4: Remove the duplicate _pw definition (now moved to the top)
replace(
  'Remove duplicate _pw definition (now at top of function)',
  `  const _pw = _filterWorkoutsByPeriod(workouts, _dashPeriod);
  renderVolumeChart(buildWeeklyVolume(_pw));`,
  `  renderVolumeChart(buildWeeklyVolume(_pw));`
);

// PATCH 5: Fix heatmap to always use full workouts (recovery view, not period view)
replace(
  'Fix heatmap: use workouts not _pw',
  `  renderBodyHeatmap(_pw);`,
  `  renderBodyHeatmap(workouts); // recovery view \u2014 always all-time`
);

// PATCH 6: Add _renderOverviewSnapshot() call at end of renderDashboard, before switchDashTab
replace(
  'Add _renderOverviewSnapshot call in renderDashboard',
  `  // Apply active tab filter
  switchDashTab(_dashActiveTab, document.querySelector('.dash-tab.active'));`,
  `  // Render the quick snapshot bar (overview tab)
  if (typeof _renderOverviewSnapshot === 'function') _renderOverviewSnapshot();
  // Apply active tab filter
  switchDashTab(_dashActiveTab, document.querySelector('.dash-tab.active'));`
);

// PATCH 7: Add _renderOverviewSnapshot() function definition
// Insert after renderDashboard closing brace — find the last line of renderDashboard
// We look for the recomp nudge block which is at the end of renderDashboard
replace(
  'Add _renderOverviewSnapshot function definition',
  `function switchDashTab(name, btn) {`,
  `// \u26a1\u26a1 Overview Quick Snapshot \u26a1\u26a1 \u2014 period-aware insights bar
function _renderOverviewSnapshot() {
  const _pw = _filterWorkoutsByPeriod(workouts, _dashPeriod);

  // Streak (consecutive days trained)
  const _streak = typeof calcStreak === 'function' ? calcStreak() : 0;
  const elStreak = document.getElementById('snap-streak');
  if (elStreak) {
    elStreak.textContent = _streak;
    elStreak.className = 'snap-val' + (_streak >= 3 ? ' snap-pos' : _streak > 0 ? '' : ' snap-neutral');
  }

  // Days since last session
  const elLast = document.getElementById('snap-last');
  if (elLast) {
    if (!workouts.length) {
      elLast.textContent = '\u2014';
      elLast.className = 'snap-val snap-neutral';
    } else {
      const _lastD = new Date(workouts[workouts.length - 1].date);
      const _dAgo = Math.floor((Date.now() - _lastD.getTime()) / 86400000);
      elLast.textContent = _dAgo === 0 ? 'Today' : _dAgo === 1 ? 'Yest.' : _dAgo + 'd ago';
      elLast.className = 'snap-val' + (_dAgo <= 2 ? ' snap-pos' : _dAgo > 4 ? ' snap-neg' : '');
    }
  }

  // Volume trend vs previous period
  const elTrend = document.getElementById('snap-trend');
  if (elTrend) {
    if (_dashPeriod === 'ALL') {
      elTrend.textContent = workouts.length;
      elTrend.className = 'snap-val snap-neutral';
      const lbl = document.getElementById('snap-trend-lbl');
      if (lbl) lbl.textContent = 'total sessions';
    } else {
      const _td = _dashPeriod === '7D' ? 7 : _dashPeriod === '1M' ? 30 : _dashPeriod === '3M' ? 90 : 180;
      const _pEnd = new Date(); _pEnd.setDate(_pEnd.getDate() - _td);
      const _pStart = new Date(_pEnd); _pStart.setDate(_pStart.getDate() - _td);
      const _prevPw2 = workouts.filter(w => {
        const d = (w.date || '').slice(0, 10);
        return d >= _pStart.toISOString().slice(0, 10) && d < _pEnd.toISOString().slice(0, 10);
      });
      const _curVol = _pw.reduce((a,w) => a + (w.totalVolume||0), 0);
      const _prevVol2 = _prevPw2.reduce((a,w) => a + (w.totalVolume||0), 0);
      if (_prevVol2 > 0) {
        const _d2 = Math.round(((_curVol - _prevVol2) / _prevVol2) * 100);
        const _s = _d2 >= 0 ? '+' : '';
        elTrend.textContent = _s + _d2 + '%';
        elTrend.className = 'snap-val' + (_d2 >= 0 ? ' snap-pos' : ' snap-neg');
      } else {
        elTrend.textContent = '\u2014';
        elTrend.className = 'snap-val snap-neutral';
      }
      const lbl2 = document.getElementById('snap-trend-lbl');
      if (lbl2) lbl2.textContent = 'vs prev period';
    }
  }

  // PRs set in current period
  const elPRs = document.getElementById('snap-prs');
  if (elPRs) {
    const _prCount = _pw.filter(w => w.isPR).length;
    elPRs.textContent = _prCount;
    elPRs.className = 'snap-val' + (_prCount > 0 ? ' snap-pos' : ' snap-neutral');
  }

  // Update heatmap badge to show recovery context
  const _heatBadge = document.getElementById('heatmap-legend-badge');
  if (_heatBadge) _heatBadge.textContent = 'RECOVERY STATUS';
}

function switchDashTab(name, btn) {`
);

// PATCH 8: Add CSS for the Overview Snapshot bar
// Insert before the first dash-tab-strip CSS rule
replace(
  'Add .overview-snapshot CSS',
  `.dash-tab-strip {`,
  `.overview-snapshot {
  display:flex;align-items:center;background:var(--card);border-radius:14px;
  padding:14px 6px;margin:0 0 10px;border:1px solid rgba(255,255,255,.06);
}
.snap-item { text-align:center; flex:1; padding:0 4px; }
.snap-val { font-family:'Bebas Neue',cursive; font-size:24px; color:var(--accent); line-height:1; }
.snap-val.snap-pos { color:#2ecc71; }
.snap-val.snap-neg { color:#e74c3c; }
.snap-val.snap-neutral { color:var(--text3); }
.snap-lbl { font-family:'Barlow Condensed',sans-serif; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:.8px; margin-top:3px; }
.snap-sep { width:1px; height:32px; background:rgba(255,255,255,.08); flex-shrink:0; }
.dash-tab-strip {`
);

// PATCH 9: Add HTML for the Overview Snapshot bar
// Insert it as the FIRST data-dash-tab="overview" element, before the Muscle Heatmap panel
replace(
  'Add overview-snapshot HTML element before heatmap panel',
  `    <!-- MUSCLE HEATMAP -->
    <div class="panel" id="muscle-heatmap-panel" data-dash-tab="overview">`,
  `    <!-- OVERVIEW QUICK SNAPSHOT BAR -->
    <div class="overview-snapshot" data-dash-tab="overview" id="overview-snapshot">
      <div class="snap-item">
        <div class="snap-val snap-neutral" id="snap-streak">0</div>
        <div class="snap-lbl">\uD83D\uDD25 streak</div>
      </div>
      <div class="snap-sep"></div>
      <div class="snap-item">
        <div class="snap-val snap-neutral" id="snap-last">\u2014</div>
        <div class="snap-lbl">\uD83D\uDCC5 last session</div>
      </div>
      <div class="snap-sep"></div>
      <div class="snap-item">
        <div class="snap-val snap-neutral" id="snap-trend">\u2014</div>
        <div class="snap-lbl" id="snap-trend-lbl">\uD83D\uDCC8 vs prev period</div>
      </div>
      <div class="snap-sep"></div>
      <div class="snap-item">
        <div class="snap-val snap-neutral" id="snap-prs">0</div>
        <div class="snap-lbl">\u2B50 PRs (period)</div>
      </div>
    </div>

    <!-- MUSCLE HEATMAP -->
    <div class="panel" id="muscle-heatmap-panel" data-dash-tab="overview">`
);

// Write result
fs.writeFileSync(path, content, 'utf8');
const newLength = content.length;

// Write log
const result = [
  '=== OVERVIEW PATCH RESULT ===',
  'Patches applied: ' + patchCount,
  'File size: ' + originalLength + ' -> ' + newLength + ' chars',
  '',
  ...log
].join('\n');

fs.writeFileSync('C:/Users/USER/Desktop/Claude/Forg OS Gym V3 - Working version/_overview_result.txt', result);
console.log(result);
