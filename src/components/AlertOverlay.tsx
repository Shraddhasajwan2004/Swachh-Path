import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useBins } from '../context/BinContext';

export default function AlertOverlay() {
  const { alerts, clearAlert } = useBins();

  useEffect(() => {
    if (alerts.length > 0) {
      const timer = setTimeout(() => {
        clearAlert(alerts[0].time);
      }, 2000); // 2 second popup as requested
      return () => clearTimeout(timer);
    }
  }, [alerts, clearAlert]);

  return (
    <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.time}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="pointer-events-auto glass-panel p-4 border-cyber-danger/50 shadow-[0_0_20px_rgba(255,0,60,0.2)] flex items-start gap-4 max-w-sm"
          >
            <div className="p-2 bg-cyber-danger/20 rounded-lg border border-cyber-danger/50">
              <AlertTriangle className="w-5 h-5 text-cyber-danger neon-text" />
            </div>
            <div className="flex-grow">
              <h4 className="font-display font-bold text-cyber-danger text-xs uppercase tracking-widest mb-1">
                Critical Alert
              </h4>
              <p className="text-[10px] text-white font-sans leading-relaxed">
                {alert.name} bin is {alert.type} filled!
              </p>
              <p className="text-[8px] text-slate-500 mt-2 font-mono uppercase">
                {new Date(alert.time).toLocaleTimeString()}
              </p>
            </div>
            <button 
              onClick={() => clearAlert(alert.time)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
