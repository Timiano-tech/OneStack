'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiX, FiCheck, FiVideo, FiImage, FiChevronLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { AnimatedPage } from '../components/AnimatedPage';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { createStory } from '../services/storyService';
import { toast } from '../components/Toast';

export function StoriesCreate() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 20 * 1024 * 1024) { // 20MB limit
      toast.error('File size must be under 20MB');
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
  };

  const handleSubmit = async () => {
    if (!user || !file) return;
    setLoading(true);
    try {
      await createStory({
        userId: user.id,
        campusId: (user as any).campusId,
        file,
        caption
      });
      toast.success('Story posted!');
      router.push('/feed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to post story');
    } finally {
      setLoading(false);
    }
  };

  const isVideo = file?.type.startsWith('video/');

  return (
    <AnimatedPage className="min-h-screen" style={{ background: '#000' }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md">
           <FiChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold text-white uppercase tracking-widest">Create Story</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex h-screen flex-col items-center justify-center p-4">
         {!preview ? (
           <div className="flex flex-col items-center gap-6">
             <motion.div
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => fileInputRef.current?.click()}
               className="flex h-64 w-64 cursor-pointer flex-col items-center justify-center rounded-[3rem] border-2 border-dashed gap-4"
               style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}
             >
               <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-black">
                 <FiCamera size={32} />
               </div>
               <div className="text-center">
                 <p className="font-bold text-white">Tap to upload</p>
                 <p className="text-xs text-secondary mt-1">Photo or Video</p>
               </div>
             </motion.div>
             <input
               ref={fileInputRef}
               type="file"
               accept="image/*,video/*"
               className="hidden"
               onChange={handleFileChange}
             />
             <p className="max-w-[240px] text-center text-xs text-gray-500">
               Stories disappear after 24 hours. Be respectful of your campus community.
             </p>
           </div>
         ) : (
           <div className="relative h-[85vh] w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl">
             {isVideo ? (
               <video src={preview} autoPlay loop muted className="h-full w-full object-cover" />
             ) : (
               <img src={preview} alt="Preview" className="h-full w-full object-cover" />
             )}
             
             {/* Overlay controls */}
             <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 text-sm text-white outline-none border border-white/20 placeholder:text-gray-400"
                  maxLength={100}
                />
                
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleRemove}
                    className="flex-1 rounded-2xl bg-white/10 py-3 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-[2] rounded-2xl bg-white py-3 text-sm font-bold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {loading ? 'Posting...' : 'Post Story'}
                  </button>
                </div>
             </div>

             <button 
               onClick={handleRemove}
               className="absolute top-16 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
             >
               <FiX size={20} />
             </button>
           </div>
         )}
      </div>
    </AnimatedPage>
  );
}
