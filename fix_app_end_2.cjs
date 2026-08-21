const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// There might be a newline or something at the end of the file.
const idx = content.lastIndexOf('onOpenFeed={() => }');
if (idx !== -1) {
   content = content.substring(0, idx) + '/>\n      </main>\n    </div>\n  );\n}\n\nexport default App;\n';
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed App.tsx end');
