const fs = require('fs');
const src = fs.readFileSync('C:/Users/USER/Desktop/Claude/Forg OS Gym V3 - Working version/index.html', 'utf8');
const blocks = [];
const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let m;
while ((m = re.exec(src)) !== null) blocks.push({ index: blocks.length + 1, code: m[1] });

let ok = 0, fail = 0;
blocks.forEach(b => {
  try { new Function(b.code); ok++; } catch(e) { fail++; console.log('FAIL block ' + b.index + ': ' + e.message); }
});
const result = `Scripts OK: ${ok}  Failed: ${fail}`;
console.log(result);
fs.writeFileSync('C:/Users/USER/Desktop/Claude/Forg OS Gym V3 - Working version/_check_out.txt', result);
