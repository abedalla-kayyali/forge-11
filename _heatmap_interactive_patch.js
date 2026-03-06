// ═══════════════════════════════════════════════════════════════
//  HEATMAP INTERACTIVE PATCH
//  1. Fix CSS override (remove fill from .hz class rule)
//  2. Fix JS path template (use style= + add data-muscle + onclick)
//  3. Add _openMuscleDetail() + _closeMuscleDetail()
//  4. Add _shareMuscleCard() + _buildShareText()
//  5. Add modal HTML before </body>
//  6. Add modal CSS after heatmap CSS block
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'index.html');
let html = fs.readFileSync(FILE, 'utf8');
const results = [];

// ─── helper ────────────────────────────────────────────────────
function patch(label, find, replace) {
  if (!html.includes(find)) {
    results.push(`❌ NOT FOUND: ${label}`);
    return false;
  }
  html = html.replace(find, replace);
  results.push(`✅ OK: ${label}`);
  return true;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATCH 1 — Remove fill from .hz CSS class so inline style wins
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
patch(
  'CSS: remove fill from .hz class rule',
  `.heatmap-svg .hz{fill:var(--heat-cold,#1a2e1a);stroke:var(--border);stroke-width:.8;transition:fill .3s;}`,
  `.heatmap-svg .hz{stroke:var(--border);stroke-width:.8;transition:fill .3s,filter .2s;cursor:pointer;}
.heatmap-svg .hz:hover{filter:brightness(1.35) drop-shadow(0 0 4px currentColor);}`
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATCH 2 — Fix JS path template: inline style + data-muscle + onclick
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
patch(
  'JS: path template → inline style + data-muscle + onclick',
  `return \`<path class="hz" d="\${d}" fill="\${c}" stroke="var(--border)" stroke-width=".8" opacity=".9"/>\`;`,
  `return \`<path class="hz" data-muscle="\${muscle}" style="fill:\${c}" onclick="_openMuscleDetail('\${muscle}')" d="\${d}" stroke="var(--border)" stroke-width=".8" opacity=".9"/>\`;`
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATCH 3 — Add modal CSS after heatmap CSS block
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MODAL_CSS = `
/* ── Muscle Detail Modal ── */
#muscle-detail-modal{position:fixed;inset:0;z-index:9000;display:none;align-items:flex-end;justify-content:center;}
#muscle-detail-modal.open{display:flex;}
.mdc-overlay{position:absolute;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(3px);}
.mdc-card{position:relative;z-index:1;width:100%;max-width:480px;background:var(--card);border-radius:22px 22px 0 0;padding:20px 18px 32px;max-height:88vh;overflow-y:auto;animation:slideUpModal .32s cubic-bezier(.22,1,.36,1);}
@keyframes slideUpModal{from{transform:translateY(100%)}to{transform:translateY(0)}}
.mdc-drag-handle{width:40px;height:4px;border-radius:2px;background:rgba(255,255,255,.18);margin:0 auto 16px;}
.mdc-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
.mdc-muscle-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
.mdc-muscle-name{font-family:'Bebas Neue',cursive;font-size:28px;color:var(--text1);line-height:1;}
.mdc-status-badge{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:3px 9px;border-radius:20px;font-weight:600;}
.mdc-date-row{font-family:'DM Mono',monospace;font-size:11px;color:var(--text3);margin-bottom:14px;display:flex;align-items:center;gap:6px;}
.mdc-divider{height:1px;background:rgba(255,255,255,.07);margin:10px 0;}
.mdc-section-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);margin-bottom:8px;}
.mdc-ex-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);}
.mdc-ex-row:last-child{border-bottom:none;}
.mdc-ex-icon{font-size:16px;width:26px;text-align:center;flex-shrink:0;}
.mdc-ex-name{flex:1;font-family:'Barlow Condensed',sans-serif;font-size:16px;color:var(--text1);}
.mdc-ex-detail{font-family:'DM Mono',monospace;font-size:12px;color:var(--text3);}
.mdc-pr-badge{font-size:10px;background:linear-gradient(135deg,#f1c40f,#e67e22);color:#000;padding:2px 7px;border-radius:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.5px;}
.mdc-stats-row{display:flex;justify-content:space-around;background:rgba(255,255,255,.04);border-radius:14px;padding:14px 8px;margin:14px 0 16px;}
.mdc-stat-item{text-align:center;}
.mdc-stat-val{font-family:'Bebas Neue',cursive;font-size:26px;color:var(--accent);line-height:1;}
.mdc-stat-lbl{font-family:'DM Mono',monospace;font-size:9px;color:var(--text3);letter-spacing:.5px;text-transform:uppercase;}
.mdc-delta{font-family:'DM Mono',monospace;font-size:10px;text-align:center;margin:-8px 0 14px;letter-spacing:.3px;}
.mdc-delta.up{color:#2ecc71;} .mdc-delta.down{color:#e74c3c;} .mdc-delta.same{color:var(--text3);}
.mdc-actions{display:flex;gap:10px;margin-top:4px;}
.mdc-train-btn{flex:1;background:var(--accent);color:#000;border:none;border-radius:14px;padding:14px;font-family:'Bebas Neue',cursive;font-size:18px;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;}
.mdc-share-btn{flex:1;background:rgba(255,255,255,.08);color:var(--text1);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px;font-family:'Bebas Neue',cursive;font-size:18px;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;}
.mdc-share-btn:active,.mdc-train-btn:active{transform:scale(.97);}
.mdc-forge-brand{text-align:center;font-family:'DM Mono',monospace;font-size:9px;color:var(--text3);letter-spacing:1.5px;text-transform:uppercase;margin-top:12px;opacity:.5;}
`;

patch(
  'CSS: add muscle detail modal styles',
  `.heatmap-legend-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.5px;color:var(--text3);}`,
  `.heatmap-legend-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.5px;color:var(--text3);}${MODAL_CSS}`
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATCH 4 — Add modal HTML before </body>
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MODAL_HTML = `
<!-- ── Muscle Detail Modal ── -->
<div id="muscle-detail-modal" role="dialog" aria-modal="true">
  <div class="mdc-overlay" onclick="_closeMuscleDetail()"></div>
  <div class="mdc-card">
    <div class="mdc-drag-handle"></div>
    <div class="mdc-header">
      <div class="mdc-muscle-icon" id="mdc-icon">💪</div>
      <div>
        <div class="mdc-muscle-name" id="mdc-name">CHEST</div>
        <div class="mdc-status-badge" id="mdc-badge">Ready</div>
      </div>
    </div>
    <div class="mdc-date-row" id="mdc-date">📅 No sessions yet</div>
    <div class="mdc-divider"></div>
    <div class="mdc-section-lbl">LAST SESSION EXERCISES</div>
    <div id="mdc-exercises"><!-- filled by JS --></div>
    <div class="mdc-stats-row" id="mdc-stats-row">
      <div class="mdc-stat-item"><div class="mdc-stat-val" id="mdc-vol">—</div><div class="mdc-stat-lbl">Volume kg</div></div>
      <div class="mdc-stat-item"><div class="mdc-stat-val" id="mdc-sets">—</div><div class="mdc-stat-lbl">Total Sets</div></div>
      <div class="mdc-stat-item"><div class="mdc-stat-val" id="mdc-excount">—</div><div class="mdc-stat-lbl">Exercises</div></div>
    </div>
    <div class="mdc-delta" id="mdc-delta"></div>
    <div class="mdc-actions">
      <button class="mdc-train-btn" id="mdc-train-btn" onclick="_mdcTrainNow()">🔥 TRAIN NOW</button>
      <button class="mdc-share-btn" onclick="_shareMuscleCard()">📤 SHARE</button>
    </div>
    <div class="mdc-forge-brand">⚡ FORGE GYM TRACKER</div>
  </div>
</div>

`;

patch(
  'HTML: muscle detail modal before </body>',
  `</body>`,
  `${MODAL_HTML}</body>`
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATCH 5 — Add JS functions before closing </script> of block 1
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MODAL_JS = `
// ═══════════════════════════════════════════════════
//  MUSCLE DETAIL MODAL + SHARE CARD
// ═══════════════════════════════════════════════════

let _mdcCurrentMuscle = null;

// Emoji map for each muscle group
const MUSCLE_EMOJI = {
  'Chest':'🫁','Back':'🦴','Shoulders':'🔱','Biceps':'💪','Triceps':'💪',
  'Core':'🎯','Legs':'🦵','Glutes':'🍑','Calves':'🦵','Forearms':'🦾',
  'Traps':'🏔️','Lower Back':'⚡'
};
const MUSCLE_GRAD = {
  'Chest':'linear-gradient(135deg,#2ecc71,#27ae60)',
  'Back':'linear-gradient(135deg,#3498db,#2980b9)',
  'Shoulders':'linear-gradient(135deg,#9b59b6,#8e44ad)',
  'Biceps':'linear-gradient(135deg,#e67e22,#d35400)',
  'Triceps':'linear-gradient(135deg,#e74c3c,#c0392b)',
  'Core':'linear-gradient(135deg,#f1c40f,#f39c12)',
  'Legs':'linear-gradient(135deg,#1abc9c,#16a085)',
  'Glutes':'linear-gradient(135deg,#e91e63,#c2185b)',
  'Calves':'linear-gradient(135deg,#00bcd4,#0097a7)',
  'Forearms':'linear-gradient(135deg,#ff9800,#f57c00)',
  'Traps':'linear-gradient(135deg,#607d8b,#455a64)',
  'Lower Back':'linear-gradient(135deg,#673ab7,#512da8)'
};

function _openMuscleDetail(muscle) {
  _mdcCurrentMuscle = muscle;
  const modal = document.getElementById('muscle-detail-modal');
  if (!modal) return;

  // ── Get all sessions for this muscle, newest first
  const sessions = (workouts || [])
    .filter(w => w.muscle === muscle)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const lastSession = sessions[0] || null;
  const prevSession = sessions[1] || null;

  // ── Header: icon + name + status badge
  const icon = document.getElementById('mdc-icon');
  const nameEl = document.getElementById('mdc-name');
  const badge = document.getElementById('mdc-badge');
  if (icon) {
    icon.textContent = MUSCLE_EMOJI[muscle] || '💪';
    icon.style.background = MUSCLE_GRAD[muscle] || 'var(--accent)';
  }
  if (nameEl) nameEl.textContent = muscle.toUpperCase();

  // Recovery status from heatmap heat colors
  let statusText = 'Never Trained';
  let statusStyle = 'background:rgba(255,255,255,.08);color:var(--text3)';
  if (lastSession) {
    const d = Math.floor((Date.now() - new Date(lastSession.date).getTime()) / 86400000);
    if      (d <= 2)  { statusText = '🔴 Sore (0–2d)';      statusStyle = 'background:#e74c3c33;color:#e74c3c'; }
    else if (d <= 5)  { statusText = '🟠 Recovering (3–5d)'; statusStyle = 'background:#e67e2233;color:#e67e22'; }
    else if (d <= 10) { statusText = '🟡 Ready (6–10d)';     statusStyle = 'background:#f1c40f33;color:#f1c40f'; }
    else if (d <= 20) { statusText = '🟢 Primed (11–20d)';   statusStyle = 'background:#2ecc7133;color:#2ecc71'; }
    else              { statusText = '⚪ Rested (21+d)';      statusStyle = 'background:rgba(255,255,255,.08);color:var(--text3)'; }
  }
  if (badge) { badge.textContent = statusText; badge.style.cssText = statusStyle; }

  // ── Date row
  const dateEl = document.getElementById('mdc-date');
  if (dateEl) {
    if (!lastSession) {
      dateEl.innerHTML = '📅 No sessions logged yet — start training!';
    } else {
      const d = new Date(lastSession.date);
      const dStr = d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
      const tStr = d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
      dateEl.innerHTML = \`📅 \${dStr} &nbsp;⏱ \${tStr} &nbsp;•&nbsp; \${sessions.length} total session\${sessions.length !== 1 ? 's' : ''}\`;
    }
  }

  // ── Exercises for last session
  const exEl = document.getElementById('mdc-exercises');
  if (exEl) {
    if (!lastSession) {
      exEl.innerHTML = '<div style="color:var(--text3);font-family:Barlow Condensed,sans-serif;font-size:14px;padding:12px 0;">No workout data yet</div>';
    } else {
      // Group sets by exercise for this session (same date+muscle)
      const sessionDate = (lastSession.date || '').slice(0, 10);
      const sessionExercises = sessions.filter(w => (w.date || '').slice(0, 10) === sessionDate);

      if (sessionExercises.length > 0) {
        exEl.innerHTML = sessionExercises.map(w => {
          const sets = (w.sets || []);
          const bestSet = sets.reduce((best, s) => (s.weight > (best.weight || 0) ? s : best), sets[0] || {});
          const setsSummary = sets.length > 0
            ? \`\${sets.length}×\${bestSet.reps || '?'} @ \${bestSet.weight || '?'}\${bestSet.unit || 'kg'}\`
            : 'No sets';
          const isPR = w.isPR;
          return \`
            <div class="mdc-ex-row">
              <div class="mdc-ex-icon">🏋️</div>
              <div class="mdc-ex-name">\${w.exercise || 'Unknown'}</div>
              <div class="mdc-ex-detail">\${setsSummary}</div>
              \${isPR ? '<div class="mdc-pr-badge">⭐ PR</div>' : ''}
            </div>\`;
        }).join('');
      } else {
        exEl.innerHTML = \`
          <div class="mdc-ex-row">
            <div class="mdc-ex-icon">🏋️</div>
            <div class="mdc-ex-name">\${lastSession.exercise || 'Unknown'}</div>
            <div class="mdc-ex-detail">\${(lastSession.sets || []).length} sets</div>
            \${lastSession.isPR ? '<div class="mdc-pr-badge">⭐ PR</div>' : ''}
          </div>\`;
      }
    }
  }

  // ── Stats row: volume, sets, exercises
  const sessionDate2 = lastSession ? (lastSession.date || '').slice(0, 10) : null;
  const sessionExs2 = sessionDate2 ? sessions.filter(w => (w.date || '').slice(0, 10) === sessionDate2) : (lastSession ? [lastSession] : []);
  const totalVol   = sessionExs2.reduce((a, w) => a + (w.totalVolume || 0), 0);
  const totalSets  = sessionExs2.reduce((a, w) => a + (w.sets || []).length, 0);
  const totalExs   = [...new Set(sessionExs2.map(w => w.exercise))].length || (lastSession ? 1 : 0);

  const volEl    = document.getElementById('mdc-vol');
  const setsEl   = document.getElementById('mdc-sets');
  const excEl    = document.getElementById('mdc-excount');
  if (volEl)  volEl.textContent  = totalVol  > 0 ? (totalVol >= 1000 ? (totalVol/1000).toFixed(1)+'t' : totalVol.toLocaleString() + 'kg') : '—';
  if (setsEl) setsEl.textContent = totalSets > 0 ? totalSets : '—';
  if (excEl)  excEl.textContent  = totalExs  > 0 ? totalExs  : '—';

  // ── Volume delta vs previous session
  const deltaEl = document.getElementById('mdc-delta');
  if (deltaEl) {
    if (prevSession && totalVol > 0) {
      const prevDate = (prevSession.date || '').slice(0, 10);
      const prevExs = sessions.filter(w => (w.date || '').slice(0, 10) === prevDate);
      const prevVol = prevExs.reduce((a, w) => a + (w.totalVolume || 0), 0);
      if (prevVol > 0) {
        const pct = Math.round(((totalVol - prevVol) / prevVol) * 100);
        const sign = pct >= 0 ? '+' : '';
        const cls = pct > 0 ? 'up' : pct < 0 ? 'down' : 'same';
        const arrow = pct > 0 ? '📈' : pct < 0 ? '📉' : '➡️';
        deltaEl.className = \`mdc-delta \${cls}\`;
        deltaEl.textContent = \`\${arrow} \${sign}\${pct}% vs previous session (\${prevVol.toLocaleString()}kg)\`;
      } else { deltaEl.textContent = ''; }
    } else { deltaEl.textContent = ''; }
  }

  // ── Train Now button label
  const trainBtn = document.getElementById('mdc-train-btn');
  if (trainBtn) trainBtn.textContent = \`🔥 TRAIN \${muscle.toUpperCase()} NOW\`;

  // ── Show modal
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function _closeMuscleDetail() {
  const modal = document.getElementById('muscle-detail-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
  _mdcCurrentMuscle = null;
}

function _mdcTrainNow() {
  _closeMuscleDetail();
  const muscle = _mdcCurrentMuscle || (document.getElementById('mdc-name') || {}).textContent || '';
  const muscleTitle = muscle.charAt(0).toUpperCase() + muscle.slice(1).toLowerCase();
  // Pre-select the muscle in the log view
  if (typeof selectMuscle === 'function') selectMuscle(muscleTitle);
  if (typeof showView === 'function') showView('log');
}

function _buildShareText(muscle) {
  const sessions = (workouts || [])
    .filter(w => w.muscle === muscle)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const lastSession = sessions[0];
  if (!lastSession) return \`⚡ FORGE GYM\\n\\nI haven't trained \${muscle} yet — about to fix that! 💪\\n\\nTrack your gains: FORGE Gym Tracker\`;

  const d = new Date(lastSession.date);
  const dateStr = d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
  const sessionDate = (lastSession.date || '').slice(0, 10);
  const sessionExs  = sessions.filter(w => (w.date || '').slice(0, 10) === sessionDate);
  const totalVol    = sessionExs.reduce((a, w) => a + (w.totalVolume || 0), 0);
  const totalSets   = sessionExs.reduce((a, w) => a + (w.sets || []).length, 0);
  const hasPR       = sessionExs.some(w => w.isPR);

  const exerciseLines = sessionExs.map(w => {
    const sets = (w.sets || []);
    const bestSet = sets.reduce((b, s) => (s.weight > (b.weight || 0) ? s : b), sets[0] || {});
    const pr = w.isPR ? ' ⭐PR' : '';
    return \`💪 \${w.exercise || 'Exercise'} · \${sets.length}×\${bestSet.reps || '?'} @ \${bestSet.weight || '?'}\${bestSet.unit || 'kg'}\${pr}\`;
  }).join('\\n');

  const volStr = totalVol >= 1000 ? (totalVol/1000).toFixed(1)+'t' : totalVol.toLocaleString()+'kg';

  return [
    \`⚡ FORGE GYM — \${muscle.toUpperCase()} SESSION\`,
    \`📅 \${dateStr}\`,
    \`─────────────────\`,
    exerciseLines,
    \`─────────────────\`,
    \`📊 Vol: \${volStr} · \${totalSets} sets\`,
    hasPR ? \`🏆 NEW PERSONAL RECORD!\` : '',
    \`─────────────────\`,
    \`Can you beat this? Track with FORGE 💪\`,
  ].filter(Boolean).join('\\n');
}

function _shareMuscleCard() {
  const muscle = _mdcCurrentMuscle;
  if (!muscle) return;
  const text = _buildShareText(muscle);

  if (navigator.share) {
    navigator.share({ title: \`FORGE — \${muscle} Session\`, text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      // Brief toast feedback
      const btn = document.querySelector('.mdc-share-btn');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✅ COPIED!';
        btn.style.background = 'rgba(46,204,113,.15)';
        btn.style.color = '#2ecc71';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      }
    }).catch(() => {
      alert(text);
    });
  }
}

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') _closeMuscleDetail();
});
`;

patch(
  'JS: add _openMuscleDetail + _shareMuscleCard functions',
  `document.documentElement.style.setProperty('--glow-x', '50%');
document.documentElement.style.setProperty('--glow-y', '40%');

</script>`,
  `document.documentElement.style.setProperty('--glow-x', '50%');
document.documentElement.style.setProperty('--glow-y', '40%');
${MODAL_JS}
</script>`
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Write output + results
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
fs.writeFileSync(FILE, html, 'utf8');
const resultStr = results.join('\n');
console.log(resultStr);
fs.writeFileSync('_heatmap_patch_result.txt', resultStr, 'utf8');
console.log('\nDone! Check _heatmap_patch_result.txt');
