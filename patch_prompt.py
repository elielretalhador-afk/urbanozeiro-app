import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

modal_code = """
        {pendingZonePrompt && (
          <ZoneEntryPromptModal
            zone={pendingZonePrompt}
            onAccept={handleAcceptZoneConquest}
            onDecline={(z) => setPendingZonePrompt(null)}
          />
        )}
"""

if "<ZoneEntryPromptModal" not in content:
    content = content.replace("      </main>\n    </div>", modal_code + "      </main>\n    </div>")

with open('src/App.tsx', 'w') as f:
    f.write(content)
