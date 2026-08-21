const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('ForegroundService')) {
  content = content.replace(
    "import { Geolocation } from '@capacitor/geolocation';",
    "import { Geolocation } from '@capacitor/geolocation';\nimport { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';"
  );
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('Added ForegroundService import.');
}
