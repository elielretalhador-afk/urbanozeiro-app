const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/onOpenFeed=\{\(\) => \}/, 'onOpenFeed={() => {}} />\n      </main>\n    </div>\n  );\n}\n\nexport default App;\n');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed App.tsx end');
