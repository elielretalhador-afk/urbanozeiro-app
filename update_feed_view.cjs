const fs = require('fs');
let content = fs.readFileSync('src/components/FeedView.tsx', 'utf8');

// Add feedService import
if (!content.includes('publishPost')) {
    content = content.replace(
        "import { Activity, ActivityFilterType,",
        "import { publishPost } from '../lib/feedService';\nimport { Activity, ActivityFilterType,"
    );
}

// State for media
if (!content.includes('const [mediaFile, setMediaFile]')) {
    content = content.replace(
        "const [postText, setPostText] = useState('');",
        "const [postText, setPostText] = useState('');\n  const [mediaFile, setMediaFile] = useState<File | null>(null);\n  const [mediaPreview, setMediaPreview] = useState<string | null>(null);\n  const [isPublishing, setIsPublishing] = useState(false);\n  const fileInputRef = React.useRef<HTMLInputElement>(null);"
    );
}

// Add onNewPost to props if not there, wait, better to just modify the activities array but it's passed from App. We can pass onNewPost to App.
// Let's check how FeedView receives activities. It's a prop. If we just append to the state in App, we need a callback.
// Let's add onNewPost?: (post: Activity) => void;
if (!content.includes('onNewPost?:')) {
    content = content.replace(
        '  onOpenAchievements?: () => void;',
        '  onOpenAchievements?: () => void;\n  onNewPost?: (post: Activity) => void;'
    );
    content = content.replace(
        '  onOpenAchievements,\n  onRedoRoute,',
        '  onOpenAchievements,\n  onNewPost,\n  onRedoRoute,'
    );
}

// Handle file selection
const fileSelectCode = `
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const requestCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.click();
    }
  };

  const requestVideo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "video/*";
      fileInputRef.current.click();
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
`;
content = content.replace(
  "const requestCamera = () => {\n    alert('Solicitação de permissão de Câmera/Galeria: O Urbanozeiro gostaria de acessar suas fotos para publicar.');\n  };\n\n  const requestVideo = () => {\n    alert('Solicitação de permissão de Câmera: O Urbanozeiro gostaria de acessar sua câmera e microfone para gravar vídeo.');\n  };",
  fileSelectCode
);

// Handle Publish
const publishCode = `
  const handlePublish = async () => {
    if (!postText.trim() && !mediaFile) return;
    
    try {
      setIsPublishing(true);
      const newPost = await publishPost(postText, mediaFile, currentUser);
      
      // Update UI
      if (onNewPost) {
        onNewPost(newPost);
      }
      
      // Clear form
      setPostText('');
      clearMedia();
      setIsComposerOpen(false);
    } catch (e) {
      console.error("Error publishing post:", e);
      alert("Erro ao publicar. Verifique sua conexão.");
    } finally {
      setIsPublishing(false);
    }
  };
`;
content = content.replace(/  const handlePublish = \(\) => \{[\s\S]*?\};\n/, publishCode);

// Add file input and image/video preview in composer
const composerUI = `
            <div className="flex gap-3 mb-4">
              <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20 object-cover" />
              <div className="flex-1 flex flex-col gap-2">
                <textarea 
                  autoFocus
                  placeholder="O que você está pensando?"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="w-full bg-transparent border-none text-white text-base resize-none focus:ring-0 focus:outline-none placeholder:text-slate-500 min-h-[100px]"
                />
                
                {mediaPreview && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 mt-2">
                    <button 
                      onClick={clearMedia}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 text-white z-10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {mediaFile?.type.startsWith('video') ? (
                      <video src={mediaPreview} controls className="w-full max-h-[300px] object-contain" />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="w-full max-h-[300px] object-contain" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto border-t border-white/10 pt-4 flex gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
              />
              <button disabled={isPublishing} onClick={requestCamera} className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-emerald-500/20 disabled:opacity-50">
                <Camera className="w-5 h-5" /> Foto
              </button>
              <button disabled={isPublishing} onClick={requestVideo} className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-emerald-500/20 disabled:opacity-50">
                <Video className="w-5 h-5" /> Vídeo
              </button>
            </div>
`;
content = content.replace(/<div className="flex gap-3 mb-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/, composerUI + '          </div>\n        </div>\n      )}');

// Update publish button UI to show loading state
content = content.replace(
  '<button onClick={handlePublish} className="bg-emerald-500 text-black px-4 py-1.5 rounded-full font-bold text-xs uppercase hover:bg-emerald-400 transition-colors">Publicar</button>',
  '<button disabled={isPublishing} onClick={handlePublish} className="bg-emerald-500 text-black px-4 py-1.5 rounded-full font-bold text-xs uppercase hover:bg-emerald-400 transition-colors disabled:opacity-50">{isPublishing ? "Publicando..." : "Publicar"}</button>'
);

// Display media in Feed items
const mediaDisplay = `
                  {act.mediaUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                      {act.type === 'VIDEO' ? (
                        <video src={act.mediaUrl} controls className="w-full max-h-[400px] object-contain" />
                      ) : (
                        <img src={act.mediaUrl} alt="Post media" className="w-full max-h-[400px] object-cover" loading="lazy" />
                      )}
                    </div>
                  )}
                  {act.metadata && (
`;
content = content.replace(/\{act\.metadata && \(/g, mediaDisplay);

fs.writeFileSync('src/components/FeedView.tsx', content, 'utf8');
console.log('FeedView updated for publishing');
