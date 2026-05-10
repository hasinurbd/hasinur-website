import React from 'react';
import { motion } from 'motion/react';

export function FloatingIcon({ icon, top, left, delay, color = "text-blue-500/20" }: { icon: React.ReactNode; top: string; left: string; delay: number; color?: string }) {
  const duration = React.useMemo(() => 5 + Math.random() * 2, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.1, 0.4, 0.1],
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ 
        duration, 
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div 
        className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] bg-blue-600/5 rounded-full blur-[100px] animate-pulse" 
        style={{ animationDuration: '8s' }}
      ></div>
      <div 
        className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" 
        style={{ animationDuration: '10s', animationDelay: '2s' }}
      ></div>
      <div 
        className="absolute top-1/2 right-[10%] w-[20vw] h-[20vw] bg-cyan-600/5 rounded-full blur-[80px] animate-pulse" 
        style={{ animationDuration: '12s', animationDelay: '1s' }}
      ></div>
    </div>
  );
}
