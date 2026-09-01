import sys

with open('src/services/db.ts', 'r') as f:
    content = f.read()

# Replace the mission completed block in conquerZoneTransaction
old_mission_complete = """                  if (m.progress >= m.target) {
                    m.progress = m.target;
                    m.status = 'completed';
                    missionXpAwarded += m.rewardXp || 0;
                  }"""

new_mission_complete = """                  if (m.progress >= m.target) {
                    m.progress = m.target;
                    m.status = 'completed';
                    missionXpAwarded += m.rewardXp || 0;
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('clan-mission-completed', { 
                         detail: { title: m.title, xp: m.rewardXp, clanId } 
                      }));
                    }
                  }"""

if old_mission_complete in content:
    content = content.replace(old_mission_complete, new_mission_complete)
else:
    print("Could not find mission complete block!")

with open('src/services/db.ts', 'w') as f:
    f.write(content)
