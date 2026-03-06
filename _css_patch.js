const fs = require('fs');
const path = 'C:/Users/USER/Desktop/Claude/Forg OS Gym V3 - Working version/index.html';
let content = fs.readFileSync(path, 'utf8');

const OLD = `.dash-tab-strip{display:flex;`;
const NEW = `.overview-snapshot{display:flex;align-items:center;background:var(--card);border-radius:14px;padding:14px 6px;margin:0 0 10px;border:1px solid rgba(255,255,255,.06);}
.snap-item{text-align:center;flex:1;padding:0 4px;}
.snap-val{font-family:'Bebas Neue',cursive;font-size:24px;color:var(--accent);line-height:1;}
.snap-val.snap-pos{color:#2ecc71;}
.snap-val.snap-neg{color:#e74c3c;}
.snap-val.snap-neutral{color:var(--text3);}
.snap-lbl{font-family:'Barlow Condensed',sans-serif;font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-top:3px;}
.snap-sep{width:1px;height:32px;background:rgba(255,255,255,.08);flex-shrink:0;}
.dash-tab-strip{display:flex;`;

if (!content.includes(OLD)) {
  fs.writeFileSync('C:/Users/USER/Desktop/Claude/Forg OS Gym V3 - Working version/_css_result.txt', 'MISS: anchor not found');
} else {
  content = content.replace(OLD, NEW);
  fs.writeFileSync(path, content, 'utf8');
  fs.writeFileSync('C:/Users/USER/Desktop/Claude/Forg OS Gym V3 - Working version/_css_result.txt', 'OK: CSS added');
}
console.log('done');
