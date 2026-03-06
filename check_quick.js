const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
let ok = 0, fail = 0;
scripts.forEach((s, i) => {
  const body = s.replace(/<\/?script[^>]*>/g, '');
  try { new Function(body); ok++; }
  catch(e) { process.stdout.write('SCRIPT ' + i + ' ERROR: ' + e.message.substring(0, 200) + '\n'); fail++; }
});
process.stdout.write('Scripts OK: ' + ok + '  Failed: ' + fail + '\n');
process.exit(fail > 0 ? 1 : 0);
