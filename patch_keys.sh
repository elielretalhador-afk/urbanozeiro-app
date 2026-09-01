#!/bin/bash
sed -i 's/feedActivities.map(act => (/feedActivities.map((act, i) => (/g' src/components/SocialHub.tsx
sed -i 's/key={act.id}/key={`act-${act.id}-${i}`}/g' src/components/SocialHub.tsx

sed -i 's/searchResultsPlayers.map(p => (/searchResultsPlayers.map((p, i) => (/g' src/components/SocialHub.tsx
sed -i 's/key={p.id}/key={`search-player-${p.id}-${i}`}/g' src/components/SocialHub.tsx

sed -i 's/chats.map(chat => (/chats.map((chat, i) => (/g' src/components/SocialHub.tsx
sed -i 's/key={chat.id}/key={`chat-${chat.id}-${i}`}/g' src/components/SocialHub.tsx

sed -i 's/chatMessages.map(msg => {/chatMessages.map((msg, i) => {/g' src/components/SocialHub.tsx
sed -i 's/key={msg.id}/key={`msg-${msg.id}-${i}`}/g' src/components/SocialHub.tsx
