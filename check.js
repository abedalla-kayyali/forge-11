const fs = require('fs');
const html = fs.readFileSync('C:/Users/USER/Desktop/Claude/gym app/index.html', 'utf8');
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
let ok = 0, fail = 0;
scripts.forEach((s, i) => {
  const body = s.replace(/<\/?script[^>]*>/g, '');
  try { new Function(body); ok++; }
  catch(e) { console.log('SCRIPT ' + i + ' ERROR:', e.message.substring(0, 100)); fail++; }
});
console.log('Scripts OK:', ok, '  Failed:', fail);
