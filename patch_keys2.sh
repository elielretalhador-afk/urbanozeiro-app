#!/bin/bash
sed -i 's/searchResultsPosts.map(act => (/searchResultsPosts.map((act, i) => (/g' src/components/SocialHub.tsx
