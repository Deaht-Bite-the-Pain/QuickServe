const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/assets/animations/transition.json', 'utf8'));
console.log('Root Layers:');
data.layers.forEach((l, i) => console.log(`[${i}] Layer Name: "${l.nm}", Type: ${l.ty}`));
