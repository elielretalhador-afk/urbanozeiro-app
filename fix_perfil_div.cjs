const fs = require('fs');
let lines = fs.readFileSync('src/components/PerfilView.tsx', 'utf8').split('\n');

// Find the line with className="text-[9px] text-slate-400">{followingCount} seguindo</div>
// The next line is </div> (closes the followers box)
// The next line is </div> (closes the grid)
// The next line is </div> (closes the main wrapper by mistake!)

const idx = lines.findIndex(l => l.includes('{followingCount} seguindo</div>'));
if (idx !== -1) {
  // lines[idx] is followingCount seguindo
  // lines[idx+1] is </div> (follower box)
  // lines[idx+2] is </div> (grid)
  // lines[idx+3] is </div> (main wrapper)
  if (lines[idx+3].trim() === '</div>') {
     lines.splice(idx+3, 1);
  }
}

fs.writeFileSync('src/components/PerfilView.tsx', lines.join('\n'), 'utf8');
console.log('Fixed extra div in PerfilView');
