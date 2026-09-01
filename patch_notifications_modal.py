import sys

with open('src/components/NotificationsModal.tsx', 'r') as f:
    content = f.read()

# Add cases for getNotificationIcon
icon_repl = """      case 'evento':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'friend_request':
        return <Users className="w-4 h-4 text-[#fce803]" />;
      case 'friend_accept':
        return <CheckCircle2 className="w-4 h-4 text-[#fce803]" />;
      case 'new_record':
        return <Trophy className="w-4 h-4 text-[#fce803] fill-[#fce803]/30" />;
      case 'record_beaten':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'social_activity':
        return <Users className="w-4 h-4 text-[#1d4ed8]" />;"""
content = content.replace("      case 'evento':\n        return <Calendar className=\"w-4 h-4 text-blue-400\" />;", icon_repl)

# Add cases for getNotificationBadgeColor
badge_repl = """      case 'evento':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/40';
      case 'friend_request':
      case 'friend_accept':
      case 'new_record':
        return 'bg-[#fce803]/10 text-[#fce803] border-[#fce803]/30';
      case 'record_beaten':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/40';
      case 'social_activity':
        return 'bg-[#1d4ed8]/20 text-white border-[#1d4ed8]/30';"""
content = content.replace("      case 'evento':\n        return 'bg-blue-500/20 text-blue-300 border-blue-400/40';", badge_repl)

# Add cases for getTypeLabel
label_repl = """      case 'evento':
        return 'EVENTO';
      case 'friend_request':
        return 'SOCIAL';
      case 'friend_accept':
        return 'SOCIAL';
      case 'new_record':
        return 'RECORDE';
      case 'record_beaten':
        return 'RECORDE PERDIDO';
      case 'social_activity':
        return 'SOCIAL';"""
content = content.replace("      case 'evento':\n        return 'EVENTO';", label_repl)

with open('src/components/NotificationsModal.tsx', 'w') as f:
    f.write(content)
