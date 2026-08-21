const fs = require('fs');
let content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

// Fix duplicate onClose
content = content.replace(/\{ onClose,\s*onClose\?: \(\) => void;/g, '{ onClose?: () => void;');
content = content.replace(/onClose,\s*onClose,/g, 'onClose,');

// Fix optional calls
content = content.replace(/onClose\(\);/g, 'if (onClose) onClose();');

fs.writeFileSync('src/components/FeedView.tsx', content, 'utf8');
console.log('Fixed FeedView ts');
