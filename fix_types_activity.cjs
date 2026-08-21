const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

// Add mediaUrl to Activity
content = content.replace(
  '  metadata?: Record<string, any>;\n  relatedId?: string;',
  '  metadata?: Record<string, any>;\n  mediaUrl?: string;\n  relatedId?: string;'
);

// Add TEXT, IMAGE, VIDEO to ActivityType
content = content.replace(
  "  | 'TEXT_POST'",
  "  | 'TEXT_POST'\n  | 'TEXT'\n  | 'IMAGE'\n  | 'VIDEO'"
);

fs.writeFileSync('src/types/index.ts', content, 'utf8');
console.log('Types Activity patched');
