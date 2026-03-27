import React, { useState, useMemo } from 'react';
import { useBins } from '../context/BinContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  Database, 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Wifi,
  WifiOff,
  MapPin,
  Settings,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

export default function AdminDashboard() {
  const { bins, isLoading, addBinConfig, removeBinConfig, alerts } = useBins();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'bins' | 'hardware' | 'api'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newBin, setNewBin] = useState({
    name: '',
    binId: '',
    channelId: '',
    readApiKey: '',
    writeApiKey: ''
  });

  const stats = useMemo(() => {
    const total = bins.length;
    const critical = bins.filter(b => b.wet > 80 || b.dry > 80).length;
    const offline = bins.filter(b => b.status === 'offline').length;
    const totalUsage = bins.reduce((acc, b) => acc + (b.usage || 0), 0);
    
    return { total, critical, offline, totalUsage };
  }, [bins]);

  const chartData = useMemo(() => {
    return {
      labels: bins.map(b => b.name),
      datasets: [
        {
          label: t('bin.wet'),
          data: bins.map(b => b.wet),
          backgroundColor: 'rgba(0, 243, 255, 0.5)',
          borderColor: 'rgba(0, 243, 255, 1)',
          borderWidth: 1,
        },
        {
          label: t('bin.dry'),
          data: bins.map(b => b.dry),
          backgroundColor: 'rgba(255, 0, 255, 0.5)',
          borderColor: 'rgba(255, 0, 255, 1)',
          borderWidth: 1,
        }
      ]
    };
  }, [bins, t]);

  const filteredBins = bins.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toString().includes(searchQuery)
  );

  const handleAddBin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addBinConfig(newBin);
      setIsAddModalOpen(false);
      setNewBin({ name: '', binId: '', channelId: '', readApiKey: '', writeApiKey: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter neon-text">
            {t('nav.admin')}
          </h1>
          <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest mt-1">
            System Control & Real-time Monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {(['overview', 'bins', 'hardware', 'api'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-[10px] font-display font-bold uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-cyber-accent text-white shadow-[0_0_15px_rgba(0,243,255,0.3)]' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {t(`admin.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('admin.totalUsage'), value: stats.totalUsage, icon: Activity, color: 'text-cyber-accent', trend: '+12%' },
          { label: t('admin.criticalBins'), value: stats.critical, icon: AlertTriangle, color: 'text-cyber-danger', trend: '-2' },
          { label: t('admin.offlineDevices'), value: stats.offline, icon: WifiOff, color: 'text-cyber-warning', trend: 'Stable' },
          { label: t('admin.bins'), value: stats.total, icon: Database, color: 'text-cyber-success', trend: '+1' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 border-white/5 group hover:border-cyber-accent/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyber-accent/20 transition-colors`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-[10px] font-display font-bold uppercase tracking-widest ${
                stat.trend.startsWith('+') ? 'text-cyber-success' : 
                stat.trend.startsWith('-') ? 'text-cyber-danger' : 'text-slate-500'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-3xl font-display font-black text-white mb-1">{stat.value}</p>
            <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 glass-panel p-8 border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest flex items-center">
                  <Activity className="w-5 h-5 mr-3 text-cyber-accent" />
                  {t('admin.fillLevels')}
                </h2>
              </div>
              <div className="h-[300px] w-full">
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                      x: { grid: { display: false }, ticks: { color: '#64748b' } }
                    },
                    plugins: { legend: { display: false } }
                  }} 
                />
              </div>
            </div>

            <div className="glass-panel p-8 border-white/5">
              <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest flex items-center mb-8">
                <AlertTriangle className="w-5 h-5 mr-3 text-cyber-danger" />
                {t('admin.alerts')}
              </h2>
              <div className="space-y-4">
                {alerts.length > 0 ? alerts.map((alert, idx) => (
                  <div key={idx} className="p-4 bg-cyber-danger/5 border border-cyber-danger/20 rounded-xl flex items-start space-x-3">
                    <AlertTriangle className="w-4 h-4 text-cyber-danger mt-0.5" />
                    <p className="text-[10px] font-display text-cyber-danger uppercase tracking-widest leading-relaxed">
                      {alert}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <Activity className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
                    <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">No critical alerts</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'bins' && (
          <motion.div
            key="bins"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-panel border-white/5 overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search bins by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="cyber-input w-full pl-12"
                />
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-cyber-accent hover:bg-cyber-accent/90 text-white rounded-xl font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)] flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Bin
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-4 text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">{t('admin.idLocation')}</th>
                    <th className="px-8 py-4 text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">{t('admin.status')}</th>
                    <th className="px-8 py-4 text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">{t('admin.wetPercent')}</th>
                    <th className="px-8 py-4 text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">{t('admin.dryPercent')}</th>
                    <th className="px-8 py-4 text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">{t('admin.usage')}</th>
                    <th className="px-8 py-4 text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBins.map((bin) => (
                    <tr key={bin.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-cyber-accent/10 border border-cyber-accent/20 flex items-center justify-center">
                            <Database className="w-5 h-5 text-cyber-accent" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{bin.name}</p>
                            <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">ID: {bin.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-display font-bold uppercase tracking-widest ${
                          bin.status === 'online' ? 'bg-cyber-success/10 text-cyber-success border border-cyber-success/20' : 'bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/20'
                        }`}>
                          {bin.status === 'online' ? <Wifi className="w-3 h-3 mr-1.5" /> : <WifiOff className="w-3 h-3 mr-1.5" />}
                          {bin.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[60px]">
                            <div 
                              className={`h-full transition-all duration-1000 ${bin.wet > 80 ? 'bg-cyber-danger' : 'bg-cyber-accent'}`}
                              style={{ width: `${bin.wet}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-mono text-white">{bin.wet}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[60px]">
                            <div 
                              className={`h-full transition-all duration-1000 ${bin.dry > 80 ? 'bg-cyber-danger' : 'bg-cyber-accent'}`}
                              style={{ width: `${bin.dry}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-mono text-white">{bin.dry}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-mono text-white">{bin.usage}</span>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => removeBinConfig(bin.id.toString())}
                          className="p-2 text-slate-500 hover:text-cyber-danger hover:bg-cyber-danger/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'hardware' && (
          <motion.div
            key="hardware"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="glass-panel p-8 border-white/5">
              <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest flex items-center mb-8">
                <Cpu className="w-5 h-5 mr-3 text-cyber-accent" />
                {t('admin.hardwareArch')}
              </h2>
              <div className="space-y-6">
                {[
                  { component: 'ESP32-WROOM-32', role: 'Main Controller & WiFi Gateway' },
                  { component: 'HC-SR04 (x2)', role: 'Ultrasonic Fill-Level Sensors' },
                  { component: 'LJ12A3-4-Z/BX', role: 'Inductive Metal Proximity Sensor' },
                  { component: 'Neo-6M GPS', role: 'Real-time Location Tracking' },
                  { component: 'OLED 0.96"', role: 'Local Status Display' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-sm font-bold text-white">{item.component}</p>
                    <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">{item.role}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8 border-white/5">
              <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest flex items-center mb-8">
                <Settings className="w-5 h-5 mr-3 text-cyber-warning" />
                {t('admin.limitations')}
              </h2>
              <ul className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-5 h-5 rounded-full bg-cyber-warning/10 border border-cyber-warning/20 flex items-center justify-center text-[10px] font-bold text-cyber-warning flex-shrink-0">
                      {i}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(`admin.limit${i}`)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === 'api' && (
          <motion.div
            key="api"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-panel p-8 border-white/5"
          >
            <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest flex items-center mb-8">
              <Settings className="w-5 h-5 mr-3 text-cyber-accent" />
              {t('admin.apiConfig')}
            </h2>
            <div className="space-y-6">
              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 font-mono text-xs text-cyber-accent leading-relaxed">
                <p className="mb-4 text-slate-500">// Example API Endpoint Configuration</p>
                <p>const API_ENDPOINT = "https://api.thingspeak.com/update";</p>
                <p>const API_KEY = "YOUR_WRITE_API_KEY";</p>
                <p className="mt-4">payload = &#123;</p>
                <p className="ml-4">"field1": usage_count,</p>
                <p className="ml-4">"field2": dry_count,</p>
                <p className="ml-4">"field3": wet_count,</p>
                <p className="ml-4">"field4": distance_cm,</p>
                <p className="ml-4">"field5": latitude,</p>
                <p className="ml-4">"field6": longitude,</p>
                <p className="ml-4">"field7": dry_percent,</p>
                <p className="ml-4">"field8": wet_percent</p>
                <p>&#125;</p>
              </div>
              <div className="p-6 bg-cyber-accent/5 border border-cyber-accent/20 rounded-2xl">
                <p className="text-sm font-bold text-white mb-2">Integration Instructions</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To connect a new hardware device, ensure it is programmed to send data to ThingSpeak. 
                  Then, add the Channel ID and Read API Key in the "All Bins" section. 
                  The system will automatically begin polling for data every 30 seconds.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Bin Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-panel p-8 border-cyber-accent/30 shadow-[0_0_50px_rgba(0,243,255,0.2)]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-display font-bold text-white uppercase tracking-tighter">Register New Smart Bin</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddBin} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">Bin Name</label>
                    <input
                      required
                      type="text"
                      value={newBin.name}
                      onChange={(e) => setNewBin({ ...newBin, name: e.target.value })}
                      className="cyber-input w-full"
                      placeholder="e.g. Connaught Place #1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">Internal ID</label>
                    <input
                      required
                      type="text"
                      value={newBin.binId}
                      onChange={(e) => setNewBin({ ...newBin, binId: e.target.value })}
                      className="cyber-input w-full"
                      placeholder="e.g. BIN-001"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">ThingSpeak Channel ID</label>
                  <input
                    required
                    type="text"
                    value={newBin.channelId}
                    onChange={(e) => setNewBin({ ...newBin, channelId: e.target.value })}
                    className="cyber-input w-full"
                    placeholder="e.g. 2456789"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">Read API Key</label>
                  <input
                    required
                    type="text"
                    value={newBin.readApiKey}
                    onChange={(e) => setNewBin({ ...newBin, readApiKey: e.target.value })}
                    className="cyber-input w-full"
                    placeholder="Enter Read API Key"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">Write API Key (Optional for Commands)</label>
                  <input
                    type="text"
                    value={newBin.writeApiKey}
                    onChange={(e) => setNewBin({ ...newBin, writeApiKey: e.target.value })}
                    className="cyber-input w-full"
                    placeholder="Enter Write API Key"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full py-4 bg-cyber-accent hover:bg-cyber-accent/90 text-white rounded-xl font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)] flex items-center justify-center group disabled:opacity-50"
                >
                  {isAdding ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
