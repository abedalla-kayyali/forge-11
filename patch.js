const fs = require('fs');
const file = require('path').join(__dirname, 'index.html');
let html = fs.readFileSync(file, 'utf8');

const OLD = `  document.getElementById('mission-panel').innerHTML =\n    headerExtra +\n    \`<div class="mission-items">\` +\n    missions.map(m => \`\n      <div class="mission-item">\n        <div class="mission-check \${m.done?'done':''}\">\${m.done?'✓':''}</div>\n        <span class="mission-text \${m.done?'done':''}\">\${m.text}</span>\n        <span class="mission-xp">+\${m.xp} XP</span>\n      </div>\`).join('') +\n    \`</div>\`;`;

const NEW = `  const _th = '<div class="mission-title"><span>⚔️ TODAY\\'S MISSION</span><span class="mission-title-done" style="color:' + (allDone?'var(--green)':'var(--text3)') + ';">' + (allDone?'🏅 COMPLETE!':done+'/'+total+' DONE') + '</span></div>';
  const _bh = '<div style="height:5px;background:rgba(0,0,0,.3);border-radius:3px;overflow:hidden;margin-bottom:14px;border:1px solid var(--border);"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--green2),var(--accent));border-radius:3px;transition:width .8s cubic-bezier(.4,0,.2,1);box-shadow:0 0 8px rgba(57,255,143,.4);"></div></div>';
  const _ih = missions.map(m => '<div class="mission-item' + (m.done?' done-item':'') + '"><div class="mission-check' + (m.done?' done':'') + '">' + (m.done?'✓':'') + '</div><span class="mission-text' + (m.done?' done':'') + '">' + m.text + '</span><span class="mission-xp">+' + m.xp + ' XP</span></div>').join('');
  document.getElementById('mission-panel').innerHTML = _th + _bh + '<div class="mission-items">' + _ih + '</div>';`;

if (html.includes(OLD.replace(/\\n/g,'\n').replace(/\\\`/g,'`').replace(/\\'/g,"'"))) {
  html = html.replace(OLD.replace(/\\n/g,'\n').replace(/\\\`/g,'`').replace(/\\'/g,"'"), NEW);
  fs.writeFileSync(file, html, 'utf8');
  console.log('PATCHED OK');
} else {
  // Try direct string match
  const idx = html.indexOf("document.getElementById('mission-panel').innerHTML =\n    headerExtra +");
  if (idx !== -1) {
    const end = html.indexOf('`</div>`;', idx) + '`</div>`;'.length;
    html = html.slice(0, idx) + NEW + html.slice(end);
    fs.writeFileSync(file, html, 'utf8');
    console.log('PATCHED via indexOf OK, lines replaced');
  } else {
    console.log('NOT FOUND');
    console.log(html.slice(html.indexOf('allDone') - 100, html.indexOf('allDone') + 500));
  }
}
