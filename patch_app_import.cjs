const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { DatabaseService }')) {
  content = content.replace(
    /import \{ FeedService \} from "\.\/services\/feed";/,
    `import { FeedService } from "./services/feed";\nimport { DatabaseService } from "./services/db";`
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx import');
