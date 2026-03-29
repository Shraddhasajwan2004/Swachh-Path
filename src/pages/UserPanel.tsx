// src/pages/UserPanel.tsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { API_KEY as GOOGLE_MAPS_KEY } from '../constants';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { useBins } from '../context/BinContext';
import { useLanguage } from '../context/LanguageContext';
import { useBluetooth } from '../hooks/useBluetooth';
import BluetoothPanel from '../components/BluetoothPanel';

import { 
  Navigation, 
  Mic, 
  MicOff, 
  Trash2, 
  MapPin, 
  ChevronRight,
  AlertTriangle,
  Activity,
  Droplets,
  Shield,
  Locate,
  Hash,
  Ruler,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MCD_OFFICES = [
  { name: 'MCD Civic Centre', position: { lat: 28.6448, lng: 77.2245 } },
  { name: 'MCD Rohini Zone',  position: { lat: 28.7041, lng: 77.1025 } },
  { name: 'MCD South Zone',   position: { lat: 28.5273, lng: 77.2101 } },
];

export default function UserPanel() {
  const { bins, isLoading, sendCommand } = useBins();
  const { t, language } = useLanguage();
  const ble = useBluetooth();   // ← NEW: all BLE logic lives here

  const [selectedBin,   setSelectedBin]   = useState<any>(null);
  const [userLocation,  setUserLocation]  = useState<{ lat: number; lng: number } | null>(null);
  const [isListening,   setIsListening]   = useState(false);
  const [routeInfo,     setRouteInfo]     = useState<any>(null);
  const [nearestBin,    setNearestBin]    = useState<any>(null);
  const [voiceFeedback, setVoiceFeedback] = useState<string>('');
  const [activeAlert,   setActiveAlert]   = useState<string | null>(null);
  const lastAlertedBins = useRef<Set<string>>(new Set());

  // Monitor for full bins and trigger alerts
  useEffect(() => {
    const fullBins = bins.filter(bin => (bin.field7 || 0) > 80 || (bin.field8 || 0) > 80);
    fullBins.forEach(bin => {
      if (!lastAlertedBins.current.has(bin.id)) {
        setActiveAlert(`${bin.name} is filled! Use other bins.`);
        lastAlertedBins.current.add(bin.id);
        setTimeout(() => setActiveAlert(null), 2000);
      }
    });
    const fullBinIds = new Set(fullBins.map(b => b.id));
    lastAlertedBins.current.forEach(id => {
      if (!fullBinIds.has(id)) lastAlertedBins.current.delete(id);
    });
  }, [bins]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        ()    => setUserLocation({ lat: 28.6139, lng: 77.2090 })
      );
    }
  }, []);

  const findNearestBin = useCallback(() => {
    if (!userLocation || bins.length === 0) return;
    let minDist = Infinity, closest = null;
    bins.forEach(bin => {
      const d = Math.sqrt(
        Math.pow(bin.location.lat - userLocation.lat, 2) +
        Math.pow(bin.location.lng - userLocation.lng, 2)
      );
      if (d < minDist) { minDist = d; closest = bin; }
    });
    setNearestBin(closest);
    setSelectedBin(closest);
  }, [userLocation, bins]);

  const handleVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceFeedback('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); setVoiceFeedback('Listening...'); };

    recognition.onresult = async (event: any) => {
      const cmd = event.results[0][0].transcript.toLowerCase();
      setVoiceFeedback(`Heard: "${cmd}"`);

      const isDry     = cmd.includes('dry open')    || cmd.includes('open dry')    || cmd.includes('सूखा खोलो');
      const isWet     = cmd.includes('wet open')    || cmd.includes('open wet')    || cmd.includes('गीला खोलो');
      const isNearest = cmd.includes('nearest')     || cmd.includes('find nearest') || cmd.includes('पास वाला');

      if (isDry) {
        if (ble.status === 'connected') {
          // BLE is connected → send directly to hardware
          await ble.sendBLECommand('dry open');
          setVoiceFeedback('BLE Command sent: Opening Dry Bin');
        } else if (selectedBin) {
          // Fallback to server
          try { await sendCommand(selectedBin.id, 'dry_open'); setVoiceFeedback('Command sent: Opening Dry Bin'); }
          catch { setVoiceFeedback('Failed to send command.'); }
        } else {
          setVoiceFeedback('Please select a bin first.');
        }
      } else if (isWet) {
        if (ble.status === 'connected') {
          await ble.sendBLECommand('wet open');
          setVoiceFeedback('BLE Command sent: Opening Wet Bin');
        } else if (selectedBin) {
          try { await sendCommand(selectedBin.id, 'wet_open'); setVoiceFeedback('Command sent: Opening Wet Bin'); }
          catch { setVoiceFeedback('Failed to send command.'); }
        } else {
          setVoiceFeedback('Please select a bin first.');
        }
      } else if (isNearest) {
        findNearestBin();
        setVoiceFeedback('Finding nearest bin...');
      } else {
        setVoiceFeedback("Command not recognized. Try 'dry open', 'wet open', or 'find nearest bin'.");
      }
      setTimeout(() => setVoiceFeedback(''), 5000);
    };

    recognition.onerror = (event: any) => { setIsListening(false); setVoiceFeedback(`Error: ${event.error}`); };
    recognition.onend   = () => setIsListening(false);
    recognition.start();
  };

  const nearbyBins = useMemo(() => {
    if (!userLocation) return [];
    return bins
      .map(bin => ({
        ...bin,
        distance: Math.sqrt(
          Math.pow(bin.location.lat - userLocation.lat, 2) +
          Math.pow(bin.location.lng - userLocation.lng, 2)
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [bins, userLocation]);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-8 relative">

      {/* Real-time Alert Popup */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit   ={{ opacity: 0, y: -50, scale: 0.9 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-cyber-danger/90 backdrop-blur-md border border-cyber-danger/50 px-6 py-3 rounded-full shadow-[0_0_30px_rgba(255,0,60,0.3)] flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
            <span className="text-xs font-display font-bold text-white uppercase tracking-widest">{activeAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">

        {/* ── BLUETOOTH PANEL (NEW) ── */}
        <BluetoothPanel ble={ble} />

        {/* ── VOICE ASSISTANT ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0  }}
          className="glass-panel p-6 border-cyber-accent/20 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-accent/5 to-transparent opacity-50" />
          <div className="relative flex items-center justify-between mb-4">
            <h2 className="text-sm font-display font-bold text-white uppercase tracking-widest flex items-center">
              <Mic className="w-4 h-4 mr-2 text-cyber-accent" />
              {t('user.voice')}
            </h2>
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-cyber-danger animate-ping' : 'bg-cyber-success'}`} />
          </div>

          <button
            onClick={handleVoiceCommand}
            className={`w-full py-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
              isListening
                ? 'bg-cyber-danger/10 border-cyber-danger/30 text-cyber-danger'
                : 'bg-cyber-accent/10 border-cyber-accent/30 text-cyber-accent hover:bg-cyber-accent/20'
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            <span className="text-[10px] font-display font-bold uppercase tracking-widest">
              {isListening ? t('user.voice.listening') : t('user.voice.tap')}
            </span>
          </button>

          {voiceFeedback && (
            <p className="mt-3 text-[10px] font-display text-cyber-accent uppercase tracking-widest text-center animate-pulse">
              {voiceFeedback}
            </p>
          )}
        </motion.div>

        {/* ── FIND NEAREST BIN ── */}
        <button
          onClick={findNearestBin}
          className="w-full py-4 bg-cyber-accent text-white rounded-xl font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)] flex items-center justify-center group"
        >
          <Navigation className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
          {t('user.findNearest')}
        </button>

        {/* ── SELECTED BIN DETAILS ── */}
        <AnimatePresence mode="wait">
          {selectedBin ? (
            <motion.div
              key={selectedBin.id}
              initial={{ opacity: 0, y:  20 }}
              animate={{ opacity: 1, y:   0 }}
              exit   ={{ opacity: 0, y: -20 }}
              className="glass-panel p-6 border-white/5"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-white uppercase tracking-tighter">{selectedBin.name}</h3>
                  <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest mt-1">
                    {t('user.binId')}: {selectedBin.binId} • {t(`status.${selectedBin.status}`, selectedBin.status)}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${selectedBin.status === 'online' ? 'bg-cyber-success/10' : 'bg-cyber-danger/10'}`}>
                  <Activity className={`w-4 h-4 ${selectedBin.status === 'online' ? 'text-cyber-success' : 'text-cyber-danger'}`} />
                </div>
              </div>

              {/* Real-time Data Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: BarChart3, label: t('bin.usageCount', 'Usage Count'), value: selectedBin.field1 || 0,          color: 'text-white',        bg: 'bg-white/5',           border: 'border-white/5'          },
                  { icon: Hash,      label: t('bin.dryCount',   'Dry Count'),   value: selectedBin.field2 || 0,          color: 'text-white',        bg: 'bg-white/5',           border: 'border-white/5'          },
                  { icon: Hash,      label: t('bin.wetCount',   'Wet Count'),   value: selectedBin.field3 || 0,          color: 'text-white',        bg: 'bg-white/5',           border: 'border-white/5'          },
                  { icon: Ruler,     label: t('bin.distance',   'Distance'),    value: `${selectedBin.field4 || 0} cm`,  color: 'text-white',        bg: 'bg-white/5',           border: 'border-white/5'          },
                  { icon: MapPin,    label: t('bin.latitude',   'Latitude'),    value: selectedBin.field5 || 0,          color: 'text-white',        bg: 'bg-white/5',           border: 'border-white/5'          },
                  { icon: MapPin,    label: t('bin.longitude',  'Longitude'),   value: selectedBin.field6 || 0,          color: 'text-white',        bg: 'bg-white/5',           border: 'border-white/5'          },
                  { icon: Droplets,  label: t('bin.dryFilledLevel', 'Dry %'),   value: `${selectedBin.field7 || 0}%`,    color: 'text-cyber-warning', bg: 'bg-cyber-warning/10', border: 'border-cyber-warning/20' },
                  { icon: Droplets,  label: t('bin.wetFilledLevel', 'Wet %'),   value: `${selectedBin.field8 || 0}%`,    color: 'text-cyber-accent',  bg: 'bg-cyber-accent/10',  border: 'border-cyber-accent/20'  },
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border ${item.bg} ${item.border} hover:border-cyber-accent/30 transition-all`}>
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className={`w-3 h-3 ${item.color} opacity-70`} />
                      <p className={`text-[8px] font-display uppercase tracking-widest ${item.color} opacity-70`}>{item.label}</p>
                    </div>
                    <p className={`text-sm font-mono ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Route Info */}
              {routeInfo && (
                <div className="mb-6 p-4 bg-cyber-accent/5 border border-cyber-accent/20 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-display font-bold text-white uppercase tracking-widest">{t('user.routeInfo', 'Route Info')}</h4>
                    <span className="text-[10px] font-mono text-cyber-accent">{routeInfo.duration}</span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                    {routeInfo.steps.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-[10px] text-slate-400">
                        <div className="w-1 h-1 rounded-full bg-cyber-accent mt-1.5 flex-shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: step.instructions }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── OPEN DRY / WET BUTTONS ── */}
              {/* If BLE connected → sends directly to ESP32 hardware         */}
              {/* If BLE not connected → falls back to server (ThingSpeak)    */}
              <div className="space-y-2">
                {ble.status !== 'connected' && (
                  <p className="text-[9px] font-display text-slate-600 uppercase tracking-widest text-center">
                    Connect via Bluetooth above to control bin lid directly
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (ble.status === 'connected') {
                        await ble.sendBLECommand('dry open');
                      } else {
                        await sendCommand(selectedBin.id, 'dry_open');
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-display font-bold uppercase tracking-widest transition-all
                      bg-cyber-warning/10 hover:bg-cyber-warning/20 text-cyber-warning border border-cyber-warning/30
                      ${ble.status === 'connected' ? 'shadow-[0_0_15px_rgba(255,184,0,0.15)]' : 'opacity-70'}`}
                  >
                    {t('user.openDry', 'Open Dry')}
                    {ble.status === 'connected' && <span className="ml-1 text-[8px] opacity-60">· BLE</span>}
                  </button>
                  <button
                    onClick={async () => {
                      if (ble.status === 'connected') {
                        await ble.sendBLECommand('wet open');
                      } else {
                        await sendCommand(selectedBin.id, 'wet_open');
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-display font-bold uppercase tracking-widest transition-all
                      bg-cyber-accent/10 hover:bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/30
                      ${ble.status === 'connected' ? 'shadow-[0_0_15px_rgba(0,243,255,0.15)]' : 'opacity-70'}`}
                  >
                    {t('user.openWet', 'Open Wet')}
                    {ble.status === 'connected' && <span className="ml-1 text-[8px] opacity-60">· BLE</span>}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-panel p-12 border-white/5 text-center">
              <Info className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
              <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">
                {t('user.selectBin', 'Select a bin on the map to view real-time status')}
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* ── NEARBY BINS LIST ── */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-display font-bold text-white uppercase tracking-widest ml-1">
            {t('user.nearbyBins', 'Nearby Bins')}
          </h3>
          {nearbyBins.map((bin) => (
            <button
              key={bin.id}
              onClick={() => setSelectedBin(bin)}
              className={`w-full p-4 glass-panel border-white/5 hover:border-cyber-accent/30 transition-all text-left flex items-center justify-between group ${
                selectedBin?.id === bin.id ? 'border-cyber-accent/50 bg-cyber-accent/5' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  bin.wet > 80 || bin.dry > 80 ? 'bg-cyber-danger/10 text-cyber-danger' : 'bg-cyber-accent/10 text-cyber-accent'
                }`}>
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-cyber-accent transition-colors">{bin.name}</p>
                  <p className="text-[8px] font-display text-slate-500 uppercase tracking-widest">
                    {t(`status.${bin.status}`, bin.status)} • {Math.round(bin.distance * 100000) / 100} {t('user.kmAway', 'km away')}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyber-accent transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT SIDE — MAP ─────────────────────────────────────────────────── */}
      <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <APIProvider apiKey={(import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_KEY}>
          <Map
            defaultCenter={userLocation || { lat: 28.6139, lng: 77.2090 }}
            defaultZoom={13}
            mapId="bf51a910020fa25a"
            className="w-full h-full"
            gestureHandling="greedy"
            disableDefaultUI={true}
          >
            {/* User location pulse */}
            {userLocation && (
              <AdvancedMarker position={userLocation}>
                <div className="relative">
                  <div className="absolute -inset-4 bg-cyber-accent/20 rounded-full animate-ping" />
                  <div className="w-4 h-4 bg-cyber-accent rounded-full border-2 border-white shadow-lg relative z-10" />
                </div>
              </AdvancedMarker>
            )}

            {/* Bins */}
            {bins.map((bin) => (
              <AdvancedMarker key={bin.id} position={bin.location} onClick={() => setSelectedBin(bin)}>
                <div className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedBin?.id === bin.id
                    ? 'bg-cyber-accent border-white scale-110 shadow-[0_0_20px_rgba(0,243,255,0.5)]'
                    : (bin.wet > 80 || bin.dry > 80)
                    ? 'bg-cyber-danger/20 border-cyber-danger'
                    : 'bg-cyber-bg/80 border-cyber-accent/50'
                }`}>
                  <Trash2 className={`w-4 h-4 ${
                    selectedBin?.id === bin.id ? 'text-white' :
                    (bin.wet > 80 || bin.dry > 80) ? 'text-cyber-danger' : 'text-cyber-accent'
                  }`} />
                </div>
              </AdvancedMarker>
            ))}

            {/* MCD Offices */}
            {MCD_OFFICES.map((office, idx) => (
              <AdvancedMarker key={idx} position={office.position}>
                <div className="p-1.5 bg-cyber-warning/20 border border-cyber-warning rounded-lg">
                  <Shield className="w-3 h-3 text-cyber-warning" />
                </div>
              </AdvancedMarker>
            ))}

            <Directions origin={userLocation} destination={selectedBin?.location} onRouteInfo={setRouteInfo} />
          </Map>
        </APIProvider>

        {/* Map overlay controls */}
        <div className="absolute top-6 right-6 flex flex-col gap-3">
          <div className="glass-panel p-2 border-white/10 flex flex-col gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
              <Plus className="w-5 h-5" />
            </button>
            <div className="h-px bg-white/5 mx-2" />
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
              <Minus className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => userLocation && setSelectedBin(null)}
            className="glass-panel p-3 border-white/10 text-slate-400 hover:text-cyber-accent transition-all"
          >
            <Locate className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 glass-panel p-4 border-white/10 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-accent shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
            <span className="text-[10px] font-display text-slate-500 uppercase tracking-widest">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-danger shadow-[0_0_10px_rgba(255,0,60,0.5)]" />
            <span className="text-[10px] font-display text-slate-500 uppercase tracking-widest">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-warning shadow-[0_0_10px_rgba(255,184,0,0.5)]" />
            <span className="text-[10px] font-display text-slate-500 uppercase tracking-widest">MCD HQ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Directions renderer ───────────────────────────────────────────────────────
function Directions({ origin, destination, onRouteInfo }: { origin: any; destination: any; onRouteInfo: (info: any) => void }) {
  const map             = useMap();
  const routesLibrary   = useMapsLibrary('routes');
  const [directionsService,  setDirectionsService]  = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#00f3ff', strokeWeight: 5, strokeOpacity: 0.8 },
    }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination) {
      if (directionsRenderer) directionsRenderer.setDirections(null as any);
      onRouteInfo(null);
      return;
    }
    directionsService.route(
      { origin, destination, travelMode: google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0].legs[0];
          onRouteInfo({ distance: leg.distance?.text, duration: leg.duration?.text, steps: leg.steps });
        } else {
          onRouteInfo(null);
        }
      }
    );
  }, [directionsService, directionsRenderer, origin, destination, onRouteInfo]);

  return null;
}

// ── Inline SVG helpers (kept to avoid extra imports) ─────────────────────────
function Info(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  );
}
function Plus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  );
}
function Minus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
    </svg>
  );
}