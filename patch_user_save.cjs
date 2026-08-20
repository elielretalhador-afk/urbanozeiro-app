const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /try \{\n\s*localStorage\.setItem\('urbanozeiro_user', JSON\.stringify\(user\)\);\n\s*\} catch \(e\) \{\n\s*console\.error\('Error saving user profile', e\);\n\s*\}/m,
  `DatabaseService.saveUser(user);`
);

fs.writeFileSync('src/App.tsx', content);
