import sys

with open('src/components/RankingView.tsx', 'r') as f:
    content = f.read()

old_jsx = """      ) : (
        /* CLÃS VIEW */
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-yellow-400 uppercase tracking-widest">GUERRA TERRITORIAL</h2></div>
        <div className="space-y-4">"""

new_jsx = """      ) : (
        <>
        /* CLÃS VIEW */
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-yellow-400 uppercase tracking-widest">GUERRA TERRITORIAL</h2></div>
        <div className="space-y-4">"""

content = content.replace(old_jsx, new_jsx)

# Find the end of CLÃS VIEW to close the <>
# It's right before the closing div or so.
# Let's see what it ends with.
