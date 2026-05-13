import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { uploadAsset } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'motion/react';

interface MultiImageHandlerProps {
  images: string[];
  onImagesChange: (newImages: string[]) => void;
  id: string;
}

export default function MultiImageHandler({ images = [], onImagesChange, id }: MultiImageHandlerProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    const newImages = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadAsset(files[i]);
        if (url) {
          newImages.push(url);
        }
      }
      onImagesChange(newImages);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    if (fromIndex < 0 || fromIndex >= newImages.length || toIndex < 0 || toIndex >= newImages.length) return;
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleUpload(e.dataTransfer.files);
        }}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
          isDragOver ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-slate-900/50'
        }`}
      >
        <input
          type="file"
          id={`multi-upload-${id}`}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <label
          htmlFor={`multi-upload-${id}`}
          className="flex flex-col items-center cursor-pointer"
        >
          <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 mb-2">
            <Upload size={24} />
          </div>
          <p className="text-white font-bold text-sm">Click or Drag & Drop Images</p>
          <p className="text-slate-500 text-xs mt-1">Upload multiple pictures for gallery</p>
        </label>
        
        {uploading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-400 text-xs font-bold animate-pulse uppercase tracking-widest">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <AnimatePresence mode="popLayout">
          {images.map((url, index) => (
            <motion.div
              key={`${url}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('fromIndex', index.toString());
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIdx = parseInt(e.dataTransfer.getData('fromIndex'));
                if (!isNaN(fromIdx)) moveImage(fromIdx, index);
              }}
              className="relative aspect-square rounded-xl overflow-hidden group border border-white/10 bg-slate-800 cursor-move"
            >
              <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  onClick={() => removeImage(index)}
                  className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors shadow-lg"
                  title="Remove"
                >
                  <X size={14} />
                </button>
                
                <div className="flex flex-col gap-1">
                  {index > 0 && (
                    <button 
                      onClick={() => moveImage(index, index - 1)}
                      className="p-1 bg-white/20 text-white rounded hover:bg-blue-600 transition-colors"
                      title="Move Forward"
                    >
                      <ChevronLeft size={12} />
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button 
                      onClick={() => moveImage(index, index + 1)}
                      className="p-1 bg-white/20 text-white rounded hover:bg-blue-600 transition-colors"
                      title="Move Backward"
                    >
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
              
              {index === 0 && (
                <div className="absolute bottom-0 inset-x-0 bg-blue-600/90 py-0.5 text-[8px] font-black text-white text-center uppercase tracking-widest leading-tight">
                  Cover
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
