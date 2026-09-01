import re
with open('src/components/OnboardingModal.tsx', 'r') as f:
    content = f.read()

# Find the header of the onboarding modal and add the logo if not present
if "logo-rw-dark.png" not in content:
    content = content.replace(
        '<div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-center flex flex-col justify-center">',
        '''<div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-center flex flex-col justify-center">
          {/* Logo Branding */}
          <div className="flex justify-center mb-2">
            <img src="/logo-rw-dark.png" alt="THE ROLLING WARS" className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(252,232,3,0.4)]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>'''
    )

with open('src/components/OnboardingModal.tsx', 'w') as f:
    f.write(content)
