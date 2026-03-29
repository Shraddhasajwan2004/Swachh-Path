// src/components/BluetoothPanel.tsx

import React from 'react';
import { Bluetooth, BluetoothOff, Loader2, AlertCircle, Unplug, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UseBluetooth } from '../hooks/useBluetooth';

interface Props {
  ble: UseBluetooth;
}

export default function BluetoothPanel({ ble }: Props) {
  const { status, deviceName, errorMsg, connect, disconnect } = ble;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`glass-panel p-6 relative overflow-hidden transition-all border-2 ${
        status === 'connected'   ? 'border-cyber-success/30' :
        status === 'connecting'  ? 'border-cyber-warning/30' :
        status === 'error'       ? 'border-cyber-danger/30'  :
        'border-white/5'
      }`}
    >
      {/* Glow when connected */}
      {status === 'connected' && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-success/5 to-transparent pointer-events-none" />
      )}

      {/* Header row */}
      <div className="relative flex items-center justify-between mb-4">
        <h2 className="text-sm font-display font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <Bluetooth className="w-4 h-4 text-cyber-accent" />
          Bluetooth
        </h2>

        {/* Status dot + label */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'connected'  ? 'bg-cyber-success' :
            status === 'connecting' ? 'bg-cyber-warning animate-ping' :
            status === 'error'      ? 'bg-cyber-danger' :
            'bg-slate-600'
          }`} />
          <span className={`text-[10px] font-display font-bold uppercase tracking-widest ${
            status === 'connected'  ? 'text-cyber-success' :
            status === 'connecting' ? 'text-cyber-warning' :
            status === 'error'      ? 'text-cyber-danger'  :
            'text-slate-500'
          }`}>
            {status === 'connected'  ? (deviceName || 'SMART_BIN') :
             status === 'connecting' ? 'Connecting...' :
             status === 'error'      ? 'Failed' :
             'Not Connected'}
          </span>
        </div>
      </div>

      {/* Sub-label */}
      <p className="relative text-[10px] font-display text-slate-600 uppercase tracking-widest mb-4">
        {status === 'connected'
          ? 'Commands sent directly to bin over BLE'
          : status === 'connecting'
          ? 'Select SMART_BIN from the browser popup...'
          : 'Connect to control the bin lid via Bluetooth'}
      </p>

      {/* Error message */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex items-start gap-2 p-3 bg-cyber-danger/10 border border-cyber-danger/20 rounded-xl"
          >
            <AlertCircle className="w-3 h-3 text-cyber-danger flex-shrink-0 mt-0.5" />
            <p className="text-[10px] font-display text-cyber-danger uppercase tracking-widest leading-relaxed">
              {errorMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect / Disconnect button */}
      {status === 'connected' ? (
        <button
          onClick={disconnect}
          className="relative w-full py-3 bg-cyber-danger/10 hover:bg-cyber-danger/20 text-cyber-danger border border-cyber-danger/30 rounded-xl text-[10px] font-display font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <Unplug className="w-4 h-4" />
          Disconnect
        </button>
      ) : (
        <button
          onClick={connect}
          disabled={status === 'connecting'}
          className="relative w-full py-3 bg-cyber-accent/10 hover:bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/30 rounded-xl text-[10px] font-display font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'connecting'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Bluetooth className="w-4 h-4" />
          }
          {status === 'connecting' ? 'Connecting...' : 'Connect to Bin'}
        </button>
      )}

      <p className="relative mt-3 text-[9px] font-display text-slate-700 uppercase tracking-widest text-center">
        Requires Chrome or Edge · HTTPS or localhost
      </p>
    </motion.div>
  );
}