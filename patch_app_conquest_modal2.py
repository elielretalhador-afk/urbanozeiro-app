import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_modal = """                        setConquestResultModalData({
                          zone: conqueredZone,
                          zoneName: z.name,
                          durationFormatted,
                          durationSeconds: durationSec,
                          distanceKmFormatted,
                          distanceMeters: attempt.distanceInsideZone,
                          xpEarned,
                          player: currentUserProfile,
                          trackPoints: attempt.trackPoints,
                        });"""

new_modal = """                        let clanPointsAwarded = 0;
                        let clanResultStr = '';
                        if (userClan) {
                          if (z.status === 'free') {
                            clanPointsAwarded = 100;
                            clanResultStr = 'CAPTURED';
                          } else if (z.controller?.clanId === userClan.id) {
                            clanPointsAwarded = 25;
                            clanResultStr = 'DEFENDED';
                          } else {
                            clanPointsAwarded = 150;
                            clanResultStr = 'CAPTURED';
                          }
                        }

                        setConquestResultModalData({
                          zone: conqueredZone,
                          zoneName: z.name,
                          durationFormatted,
                          durationSeconds: durationSec,
                          distanceKmFormatted,
                          distanceMeters: attempt.distanceInsideZone,
                          xpEarned,
                          player: currentUserProfile,
                          trackPoints: attempt.trackPoints,
                          clanWar: userClan ? {
                            points: clanPointsAwarded,
                            result: clanResultStr,
                            clanName: userClan.name,
                          } : undefined
                        });"""

content = content.replace(old_modal, new_modal)

with open('src/App.tsx', 'w') as f:
    f.write(content)
