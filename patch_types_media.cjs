const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

if (!content.includes('mediaUrl?: string;')) {
    content = content.replace(
        '  metadata?: Record<string, any>;',
        '  metadata?: Record<string, any>;\n  mediaUrl?: string;'
    );
}

fs.writeFileSync('src/types/index.ts', content, 'utf8');
console.log('Types patched');
