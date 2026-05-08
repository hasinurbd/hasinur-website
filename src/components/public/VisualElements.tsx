import React from 'react';
import { motion } from 'motion/react';

export function FloatingIcon({ icon, top, left, delay, color = "text-blue-500/20" }: { icon: React.ReactNode; top: string; left: string; delay: number; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.1, 0.4, 0.1],
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ 
        duration: 5 + Math.random() * 2, 
        repeat: Infinity, 
        delay 
      }}
      className={`absolute ${color} pointer-events-none`}
      style={{ top, left }}
    >
      {icon}
    </motion.div>
  );
}

export function BackgroundBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/2 w-96 h-96 bg-cyan-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
}
