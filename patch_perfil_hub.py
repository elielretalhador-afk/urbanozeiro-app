import sys

with open('src/components/PerfilView.tsx', 'r') as f:
    content = f.read()

# We want to insert the grid right after the Level XP Bar.
# The Level XP bar ends with: `Ver Trilha → \n              </button>\n            )}\n          </div>\n        </div>\n      </div>`
# Or we can insert it right after the first main `</div>`

hub_section = """
      {/* ================================================== */}
      {/* HUB DO JOGADOR: NAVEGAÇÃO CENTRAL */}
      {/* ================================================== */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        
        {/* CARTEIRA & LOJA */}
        <button 
          onClick={() => onOpenWallet && onOpenWallet()}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0d141d] border border-white/10 hover:border-yellow-400/50 hover:bg-[#121b27] transition-all cursor-pointer active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(252,232,3,0.15)]">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
          <span className="text-[9px] font-black text-slate-300 font-mono-stat uppercase tracking-wider text-center">Carteira &<br/>Loja</span>
        </button>

        {/* TEMPORADA */}
        <button 
          onClick={() => onOpenSeasonHub && onOpenSeasonHub('visao_geral')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0d141d] border border-white/10 hover:border-blue-400/50 hover:bg-[#121b27] transition-all cursor-pointer active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Trophy className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[9px] font-black text-slate-300 font-mono-stat uppercase tracking-wider text-center">Ranking da<br/>Temporada</span>
        </button>

        {/* CLÃ */}
        <button 
          onClick={() => userClan ? (onOpenClanProfile && onOpenClanProfile(userClan)) : (onOpenJoinClan && onOpenJoinClan())}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0d141d] border border-white/10 hover:border-amber-400/50 hover:bg-[#121b27] transition-all cursor-pointer active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[9px] font-black text-slate-300 font-mono-stat uppercase tracking-wider text-center">Guerra de<br/>Clãs</span>
        </button>

        {/* INVENTÁRIO & COSMÉTICOS */}
        <button 
          onClick={() => onOpenWallet && onOpenWallet()} 
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0d141d] border border-white/10 hover:border-purple-400/50 hover:bg-[#121b27] transition-all cursor-pointer active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[9px] font-black text-slate-300 font-mono-stat uppercase tracking-wider text-center">Inventário &<br/>Cosméticos</span>
        </button>
      </div>
"""

insert_marker = "      </div>\n\n      {/* Social Metrics Grid */}"

if insert_marker in content:
    content = content.replace(insert_marker, "      </div>\n" + hub_section + "\n      {/* Social Metrics Grid */}")
else:
    print("Marker not found, attempting alternative.")
    insert_marker_alt = "              </button>\n            )}\n          </div>\n        </div>\n      </div>"
    if insert_marker_alt in content:
        content = content.replace(insert_marker_alt, insert_marker_alt + "\n" + hub_section)
    else:
        print("Alt marker not found either.")

with open('src/components/PerfilView.tsx', 'w') as f:
    f.write(content)
