#!/bin/bash
sed -i 's/const \[friends, setFriends\] = useState<SocialPlayer\[\]>(\[\]);/const \[friends, setFriends\] = useState<SocialPlayer\[\]>(\[\]);\n  const \[friendRequests, setFriendRequests\] = useState<SocialPlayer\[\]>(\[\]);/g' src/components/SocialHub.tsx
