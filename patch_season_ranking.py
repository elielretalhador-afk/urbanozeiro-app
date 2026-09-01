import sys

with open('src/components/SeasonHubModal.tsx', 'r') as f:
    content = f.read()

# I will replace the MOCK_SEASON_LEADERBOARD rendering with topPlayers and topClans
# Let's just find MOCK_SEASON_LEADERBOARD and replace it.
content = content.replace("MOCK_SEASON_LEADERBOARD", "topPlayers")

with open('src/components/SeasonHubModal.tsx', 'w') as f:
    f.write(content)
