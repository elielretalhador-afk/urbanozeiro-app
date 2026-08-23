const fs = require('fs');
let content = fs.readFileSync('.github/workflows/main.yml', 'utf8');

const printStep = `      - name: Print Debug Signature
        run: cd android && gradle signingReport\n`;

const buildStep = `      - name: Build APK
        run: cd android && gradle assembleDebug\n`;

content = content.replace(printStep, '');
content = content.replace(buildStep, buildStep + printStep);

fs.writeFileSync('.github/workflows/main.yml', content);
console.log("Moved step successfully.");
