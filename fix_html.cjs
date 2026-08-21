const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace the #root div
html = html.replace(
  '<div id="root" class="h-full w-full"></div>',
  '<div id="root" class="w-full" style="position: absolute; top: env(safe-area-inset-top); bottom: env(safe-area-inset-bottom); left: env(safe-area-inset-left); right: env(safe-area-inset-right); overflow: hidden; transform: translateZ(0);"></div>'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed index.html.');
