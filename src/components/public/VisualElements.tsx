import React from 'react';
import { motion } from 'motion/react';

export function FloatingIcon({
  icon,
  top,
  left,
  delay,
  color = 'text-blue-500/20',
}: {
  icon: React.ReactNode;
  top: string;
  left: string;
  delay: number;
  color?: string;
}) {
  const duration = React.useMemo(() => 5 + (delay % 2.5), [delay]);

  return (
    <motion.div
      initial={{ opacity: 0.1 }}
      animate={{
        opacity: [0.1, 0.4, 0.1],
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
      className={`absolute ${color} pointer-events-none will-change-transform`}
      style={{ top, left }}
    >
      {icon}
    </motion.div>
  );
}

export function BackgroundBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
      <div
        className="absolute top-[10%] left-[10%] w-[28vw] h-[28vw] bg-blue-600/5 rounded-full blur-[90px] animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <div
        className="absolute bottom-[10%] right-[10%] w-[32vw] h-[32vw] bg-indigo-600/5 rounded-full blur-[100px] animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/2 right-[10%] w-[20vw] h-[20vw] bg-cyan-600/5 rounded-full blur-[80px] animate-pulse"
        style={{ animationDuration: '12s', animationDelay: '1s' }}
      />
    </div>
  );
}
