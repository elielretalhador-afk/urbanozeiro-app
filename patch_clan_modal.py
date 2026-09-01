import sys

with open('src/components/ClanProfileModal.tsx', 'r') as f:
    content = f.read()

old_status = """          <div className="mb-6 bg-[#0a0e14] border border-yellow-400/20 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> STATUS TERRITORIAL
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white font-mono-stat">{clan.territoryScore || 0}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Pontuação<br/>Territorial</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white font-mono-stat">{clan.zonesControlledCount || 0}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Zonas<br/>Controladas</span>
              </div>
            </div>
          </div>"""

new_status = """          <div className="mb-6 bg-[#0a0e14] border border-yellow-400/20 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> STATUS TERRITORIAL
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white font-mono-stat">{clan.territoryScore || 0}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Pontuação<br/>Territorial</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white font-mono-stat">{clan.zonesControlledCount || 0}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Zonas<br/>Controladas</span>
              </div>
            </div>
            
            {/* Missões Section */}
            {clan.missions && clan.missions.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-4">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    MISSÕES DO CLÃ
                 </h3>
                 <div className="space-y-3">
                   {clan.missions.map((m: any, idx: number) => {
                      const isCompleted = m.status === 'completed';
                      const isExpired = m.status === 'expired';
                      const percent = Math.min(100, Math.max(0, (m.progress / m.target) * 100));
                      
                      return (
                        <div key={idx} className={`p-3 rounded-xl border ${isCompleted ? 'border-yellow-400/50 bg-yellow-400/10' : isExpired ? 'border-red-500/30 bg-red-500/10' : 'border-white/10 bg-white/5'}`}>
                           <div className="flex justify-between items-start mb-1">
                             <div className="font-bold text-white text-sm flex items-center gap-1.5 uppercase">
                                {isCompleted ? '🏆 ' : ''}{m.title}
                             </div>
                             {isCompleted ? (
                               <span className="text-[10px] text-yellow-400 font-black uppercase bg-yellow-400/20 px-2 py-0.5 rounded-full">CONCLUÍDA</span>
                             ) : isExpired ? (
                               <span className="text-[10px] text-red-400 font-black uppercase bg-red-500/20 px-2 py-0.5 rounded-full">EXPIRADA</span>
                             ) : (
                               <span className="text-[10px] text-blue-400 font-black uppercase bg-blue-500/20 px-2 py-0.5 rounded-full">{m.type}</span>
                             )}
                           </div>
                           <div className="text-xs text-slate-400 mb-2">{m.description}</div>
                           
                           {/* Progress Bar */}
                           <div className="flex items-center gap-3">
                             <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                               <div className={`h-full ${isCompleted ? 'bg-yellow-400' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                             </div>
                             <div className="text-[10px] font-mono-stat text-white whitespace-nowrap">
                               {m.progress} / {m.target}
                             </div>
                           </div>
                           
                           <div className="mt-2 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                             <span className="text-yellow-400">Recompensa: +{m.rewardXp} XP</span>
                             {!isCompleted && !isExpired && (
                               <span className="text-slate-500 font-mono-stat">{Math.max(0, Math.floor((m.expiresAt - Date.now()) / 3600000))}h restantes</span>
                             )}
                           </div>
                        </div>
                      )
                   })}
                 </div>
              </div>
            )}
          </div>"""

content = content.replace(old_status, new_status)

with open('src/components/ClanProfileModal.tsx', 'w') as f:
    f.write(content)
