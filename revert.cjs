const fs = require('fs');

function revert(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/ pt-\[env\(safe-area-inset-top\)\] pb-\[env\(safe-area-inset-bottom\)\]/g, '');
  content = content.replace(/ px-6 pt-\[calc\(1\.5rem\+env\(safe-area-inset-top\)\)\] pb-\[calc\(1\.5rem\+env\(safe-area-inset-bottom\)\)\]/g, ' p-6');
  fs.writeFileSync(filePath, content, 'utf8');
}

revert('src/App.tsx');
revert('src/components/AuthScreen.tsx');
console.log('Reverted.');
