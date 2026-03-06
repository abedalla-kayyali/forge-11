const fs = require('fs');
const html = fs.readFileSync('C:/Users/USER/Desktop/Claude/Forg OS Gym V3 - Working version/index.html', 'utf8');
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
let ok = 0, fail = 0;
const lines = [];
scripts.forEach((s, i) => {
  const body = s.replace(/<\/?script[^>]*>/g, '');
  try { new Function(body); ok++; }
  catch(e) { const msg = 'SCRIPT ' + i + ' ERROR: ' + e.message.substring(0, 120); lines.push(msg); fail++; }
});
lines.push('Scripts OK: ' + ok + '  Failed: ' + fail);
fs.writeFileSync('C:/Users/USER/Desktop/Claude/Forg OS Gym V3 - Working version/_check_result.txt', lines.join('\n'));
