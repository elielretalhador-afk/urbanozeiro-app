const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

const oldSetup = `  skateSetup: {
    model: string;
    wheels: string;
    bearings: string;
  };`;

const newSetup = `  skateSetup: {
    model?: string;
    wheels?: any;
    bearings?: any;
  };`;

content = content.replace(oldSetup, newSetup);

fs.writeFileSync('src/types/index.ts', content, 'utf8');
console.log('Fixed types');
