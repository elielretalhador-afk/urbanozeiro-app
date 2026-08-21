const fs = require('fs');

function addSafeAreaToMain(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // For standard main blocks (App.tsx)
  content = content.replace(
    /className="relative flex flex-col items-center justify-center w-full h-full max-w-md md:max-w-lg bg-\[#080B0E\] border-x border-slate-800\/40"/g,
    'className="relative flex flex-col items-center justify-center w-full h-full max-w-md md:max-w-lg bg-[#080B0E] border-x border-slate-800/40 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"'
  );
  
  // For the error block in App.tsx
  content = content.replace(
    /className="relative flex flex-col items-center justify-center w-full h-full max-w-md md:max-w-lg bg-\[#080B0E\] border-x border-slate-800\/40 p-6 text-center"/g,
    'className="relative flex flex-col items-center justify-center w-full h-full max-w-md md:max-w-lg bg-[#080B0E] border-x border-slate-800/40 px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center"'
  );
  
  // For the primary main block in App.tsx
  content = content.replace(
    /className="relative flex flex-col w-full h-full max-w-md md:max-w-lg bg-\[#080B0E\] border-x border-slate-800\/40 shadow-2xl overflow-hidden"/g,
    'className="relative flex flex-col w-full h-full max-w-md md:max-w-lg bg-[#080B0E] border-x border-slate-800/40 shadow-2xl overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"'
  );

  // For AuthScreen.tsx
  content = content.replace(
    /className="relative flex flex-col items-center justify-center w-full h-full max-w-md md:max-w-lg bg-\[#080B0E\] border-x border-slate-800\/40 p-6 overflow-y-auto"/g,
    'className="relative flex flex-col items-center justify-center w-full h-full max-w-md md:max-w-lg bg-[#080B0E] border-x border-slate-800/40 px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] overflow-y-auto"'
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

addSafeAreaToMain('src/App.tsx');
addSafeAreaToMain('src/components/AuthScreen.tsx');
console.log('Fixed safe areas.');
