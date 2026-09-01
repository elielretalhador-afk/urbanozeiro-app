import re
with open('src/components/OnboardingModal.tsx', 'r') as f:
    content = f.read()

# Make the intro logo more "Rolling Wars" cyber style
content = content.replace("from-yellow-400 to-cyan-500", "from-cyan-400 via-fuchsia-500 to-yellow-400")

# Update any mention of Urbanozeiro just in case
content = content.replace("Urbanozeiro", "THE ROLLING WARS")

with open('src/components/OnboardingModal.tsx', 'w') as f:
    f.write(content)
