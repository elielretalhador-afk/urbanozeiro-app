const http = require('http');
const fs = require('fs');

http.get('http://localhost:3000/src/App.tsx', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/sourceMappingURL=data:application\/json;base64,(.*)$/);
    if (match && match[1]) {
      const decoded = Buffer.from(match[1], 'base64').toString('utf8');
      const map = JSON.parse(decoded);
      if (map.sourcesContent && map.sourcesContent.length > 0) {
        fs.writeFileSync('src/App.tsx.recovered', map.sourcesContent[0]);
        console.log('Recovered successfully!');
      } else {
        console.log('No sourcesContent found');
      }
    } else {
      console.log('No sourcemap found');
    }
  });
});
