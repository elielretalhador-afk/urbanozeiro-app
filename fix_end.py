import sys

with open('src/components/RankingView.tsx', 'r') as f:
    content = f.read()

old_end = """            })}
          </div>
        </div>
      )}

      {/* Public Profile Modal (if triggered internally) */}"""

new_end = """            })}
          </div>
        </div>
        </>
      )}

      {/* Public Profile Modal (if triggered internally) */}"""

content = content.replace(old_end, new_end)

with open('src/components/RankingView.tsx', 'w') as f:
    f.write(content)
