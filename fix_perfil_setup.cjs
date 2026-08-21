const fs = require('fs');
let content = fs.readFileSync('src/components/PerfilView.tsx', 'utf8');

const setupSectionOld = `      {/* Setup de Patins / Gear Card */}
      <div className="mt-4 p-4 rounded-2xl bg-[#0d141d] border-2 border-white/10">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 font-mono-stat">
          <Disc className="w-4 h-4 text-emerald-400" />
          SETUP ATUAL DE RODAS
        </div>

        <div className="space-y-2 text-xs font-medium">
          <div className="flex items-center justify-between py-1.5 border-b border-white/10">
            <span className="text-slate-400 uppercase font-mono-stat text-[11px]">BOTA / MODELO</span>
            <span className="font-bold text-white">{user.skateSetup.model}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/10">
            <span className="text-slate-400 uppercase font-mono-stat text-[11px]">RODAS</span>
            <span className="font-bold text-emerald-400 font-mono-stat">{user.skateSetup.wheels}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-400 uppercase font-mono-stat text-[11px]">ROLAMENTOS</span>
            <span className="font-bold text-cyan-300 font-mono-stat">{user.skateSetup.bearings}</span>
          </div>
        </div>
      </div>`;

// We don't have the exact old code match, let's use regex
content = content.replace(/\{\/\* Setup de Patins \/ Gear Card \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `{/* Setup de Patins / Gear Card */}
      <div className="mt-4 p-4 rounded-2xl bg-[#0d141d] border-2 border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider font-mono-stat">
            <Disc className="w-4 h-4 text-emerald-400" />
            SETUP DE EQUIPAMENTO
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-equipment-modal'))} className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md hover:bg-emerald-500/20">
            Editar
          </button>
        </div>

        <div className="space-y-2 text-xs font-medium">
          <div className="flex items-center justify-between py-1.5 border-b border-white/10">
            <span className="text-slate-400 uppercase font-mono-stat text-[11px]">BOTA / MODELO</span>
            <span className="font-bold text-white">{user.skateSetup?.model || 'Não informado'}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/10">
            <span className="text-slate-400 uppercase font-mono-stat text-[11px]">RODAS</span>
            <span className="font-bold text-emerald-400 font-mono-stat text-right max-w-[60%]">
              {typeof user.skateSetup?.wheels === 'string' ? user.skateSetup.wheels : (user.skateSetup?.wheels ? \`\${user.skateSetup.wheels.brand} \${user.skateSetup.wheels.model} \${user.skateSetup.wheels.size}mm \${user.skateSetup.wheels.hardness}\` : 'Não informado')}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-400 uppercase font-mono-stat text-[11px]">ROLAMENTOS</span>
            <span className="font-bold text-cyan-300 font-mono-stat text-right max-w-[60%]">
              {typeof user.skateSetup?.bearings === 'string' ? user.skateSetup.bearings : (user.skateSetup?.bearings ? \`\${user.skateSetup.bearings.brand} \${user.skateSetup.bearings.model} \${user.skateSetup.bearings.type}\` : 'Não informado')}
            </span>
          </div>
        </div>
      </div>`);

fs.writeFileSync('src/components/PerfilView.tsx', content, 'utf8');
console.log('Fixed PerfilView setup');
