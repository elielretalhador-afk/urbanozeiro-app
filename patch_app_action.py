import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Update actionType mapping
old_action_type = """          actionType: n.actionType || (n.type === "friend_request" ? "open_social_hub" : n.type === "friend_accept" ? "open_profile" : "open_zone"),"""
new_action_type = """          actionType: n.actionType || (n.type === "cla" ? "open_clan_profile" : n.type === "friend_request" ? "open_social_hub" : n.type === "friend_accept" ? "open_profile" : "open_zone"),"""
content = content.replace(old_action_type, new_action_type)

# Update actionPayload mapping
old_action_payload = """          actionPayload: n.actionPayload || (n.type === "friend_request" ? { tab: "friends" } : n.type === "friend_accept" ? { playerId: n.senderId } : {})"""
new_action_payload = """          actionPayload: n.actionPayload || (n.type === "cla" ? { clanId: n.clanId } : n.type === "friend_request" ? { tab: "friends" } : n.type === "friend_accept" ? { playerId: n.senderId } : {})"""
content = content.replace(old_action_payload, new_action_payload)

with open('src/App.tsx', 'w') as f:
    f.write(content)
