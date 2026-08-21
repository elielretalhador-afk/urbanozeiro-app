const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
const target = `        }
      },
      (err) => {
        console.info('GPS watch fallback:', err.message);
        setIsGpsActive(false);
      },
    };
    initGPS();`;
const replacement = `        }
      }
    );
    initGPS();`;
if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
  console.log('Fixed syntax');
} else {
  console.log('Target not found');
}
