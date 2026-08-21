const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
const target = `        }
      }
    );
    initGPS();`;
const replacement = `        }
      }
    );
    } catch (e: any) {
      console.warn('Geolocation watch error', e);
    }
  };
  initGPS();`;
content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed syntax 2');
