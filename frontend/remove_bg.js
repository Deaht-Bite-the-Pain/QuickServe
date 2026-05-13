const fs = require('fs');
const filepath = 'public/assets/animations/transition.json';
const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
const originalLength = data.layers.length;
data.layers = data.layers.filter(l => !(l.ty === 1 && l.nm.toLowerCase().includes('white solid')));
console.log(`Removed ${originalLength - data.layers.length} background layer(s) from Lottie animation.`);
fs.writeFileSync(filepath, JSON.stringify(data));
