const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const str = '        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} onOpenFeed={() => }';
const idx = content.lastIndexOf(str);
if (idx !== -1) {
   content = content.substring(0, idx) + '        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />\n      </main>\n    </div>\n  );\n}\n\nexport default App;\n';
} else {
   console.log("Not found exact string. Trying index of BottomNav");
   const idx2 = content.lastIndexOf('<BottomNav');
   if (idx2 !== -1) {
     content = content.substring(0, idx2) + '<BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />\n      </main>\n    </div>\n  );\n}\n\nexport default App;\n';
   }
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed App.tsx end');
