import sys

with open('src/components/RankingView.tsx', 'r') as f:
    content = f.read()

# Wait, let's just find ) : (
old_start = """      ) : (
        /* CLÃS VIEW */
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-yellow-400 uppercase tracking-widest">GUERRA TERRITORIAL</h2></div>
        <div className="space-y-4">"""

new_start = """      ) : (
        <>
        {/* CLÃS VIEW */}
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-yellow-400 uppercase tracking-widest">GUERRA TERRITORIAL</h2></div>
        <div className="space-y-4">"""

if old_start in content:
    content = content.replace(old_start, new_start)
else:
    # If it was somewhat different
    old_start2 = """) : (
        /* CLÃS VIEW */
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-yellow-400 uppercase tracking-widest">GUERRA TERRITORIAL</h2></div>"""
    new_start2 = """) : (
        <>
        {/* CLÃS VIEW */}
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-yellow-400 uppercase tracking-widest">GUERRA TERRITORIAL</h2></div>"""
    content = content.replace(old_start2, new_start2)

with open('src/components/RankingView.tsx', 'w') as f:
    f.write(content)
