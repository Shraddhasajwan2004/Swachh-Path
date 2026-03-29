import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  useCommunity, getUserStats, BADGES,
  POINTS_PER_REPORT, POINTS_PER_VERIFIED, POINTS_PER_RESOLVED,
  type Report,
} from '../context/CommunityContext';
import {
  Camera, Upload, MapPin, Award, Star, Trophy,
  Shield, CheckCircle, Clock, X,
  ThumbsUp, AlertTriangle, Loader2,
  Image as ImageIcon, User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StatusBadge({ status }: { status: Report['status'] }) {
  const map = {
    pending:  { label: 'Pending',  cls: 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20', Icon: Clock       },
    verified: { label: 'Verified', cls: 'bg-cyber-accent/10  text-cyber-accent  border-cyber-accent/20',  Icon: CheckCircle },
    resolved: { label: 'Resolved', cls: 'bg-cyber-success/10 text-cyber-success border-cyber-success/20', Icon: Shield      },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-widest border ${map.cls}`}>
      <map.Icon className="w-3 h-3" />{map.label}
    </span>
  );
}

function ReportCard({ report, onUpvote, isOwn }: { report: Report; onUpvote: (id: string) => void; isOwn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel border overflow-hidden group hover:border-cyber-accent/20 transition-all ${
        isOwn ? 'border-cyber-accent/20' : 'border-white/5'
      }`}
    >
      {/* Top bar */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
          {isOwn && (
            <span className="px-2 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-widest border bg-cyber-accent/20 text-cyber-accent border-cyber-accent/40">
              Your Report
            </span>
          )}
        </div>
        <span className="px-2 py-1 bg-black/40 rounded-lg text-[10px] font-mono text-cyber-accent border border-cyber-accent/20">
          {report.binId}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{report.userName}</p>
            <p className="text-[9px] font-display text-slate-500 uppercase tracking-widest">{timeAgo(report.timestamp)}</p>
          </div>
          <p className="text-xs font-bold text-cyber-accent flex-shrink-0">+{report.pointsAwarded} pts</p>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{report.description}</p>

        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
          <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest truncate">{report.location.address}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-display text-slate-600 uppercase tracking-widest truncate max-w-[60%]">{report.binName}</span>
          <button
            onClick={() => onUpvote(report.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-cyber-accent/10 border border-white/10 hover:border-cyber-accent/30 rounded-lg transition-all text-slate-400 hover:text-cyber-accent flex-shrink-0"
          >
            <ThumbsUp className="w-3 h-3" />
            <span className="text-[10px] font-display font-bold uppercase tracking-widest">{report.upvotes}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunityPage() {
  const { userEmail, userName } = useAuth();
  const userId = userEmail || 'current-user';
  const { reports, addReport, upvoteReport, pendingBinReport, clearPendingBinReport } = useCommunity();

  const [isUploadOpen,  setIsUploadOpen]  = useState(false);
  const [activeTab,     setActiveTab]     = useState<'feed' | 'leaderboard' | 'mybadges'>('feed');
  const [filterStatus,  setFilterStatus]  = useState<'all' | Report['status']>('all');
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [preview,      setPreview]      = useState<string | null>(null);
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [description,  setDescription]  = useState('');
  const [binIdInput,   setBinIdInput]   = useState('');
  const [binNameInput, setBinNameInput] = useState('');
  const [userLoc,      setUserLoc]      = useState<{ lat: number; lng: number; address: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = getUserStats(userId, reports);

  useEffect(() => {
    if (!pendingBinReport) return;
    setBinIdInput(pendingBinReport.binId);
    setBinNameInput(pendingBinReport.binName);
    setUserLoc(prev =>
      prev
        ? { ...prev, address: pendingBinReport.address }
        : { lat: 28.6139, lng: 77.2090, address: pendingBinReport.address }
    );
    setIsUploadOpen(true);
    clearPendingBinReport();
  }, [pendingBinReport, clearPendingBinReport]);

  useEffect(() => {
    if (!isUploadOpen) return;
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLoc(prev => prev ?? { lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      },
      () => {
        setUserLoc(prev => prev ?? { lat: 28.6139, lng: 77.2090, address: 'New Delhi (approximate)' });
      }
    );
  }, [isUploadOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitReport = async () => {
    if (!imageFile || !description.trim()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1600));

    const newReport: Report = {
      id:            `r${Date.now()}`,
      userId,
      userName:      userName || 'Anonymous',
      avatarSeed:    userEmail || 'default',
      imageUrl:      preview!,
      binId:         binIdInput.trim()   || 'UNKNOWN',
      binName:       binNameInput.trim() || (binIdInput.trim() ? `Bin ${binIdInput.trim()}` : 'Unspecified location'),
      location:      userLoc || { lat: 28.6139, lng: 77.2090, address: 'New Delhi' },
      description:   description.trim(),
      timestamp:     new Date(),
      status:        'pending',
      upvotes:       0,
      pointsAwarded: POINTS_PER_REPORT,
    };

    addReport(newReport);
    setIsSubmitting(false);
    setSubmitSuccess(true);

    setTimeout(() => {
      setSubmitSuccess(false);
      setIsUploadOpen(false);
      setPreview(null);
      setImageFile(null);
      setDescription('');
      setBinIdInput('');
      setBinNameInput('');
      setUserLoc(null);
    }, 2200);
  };

  const filteredReports = reports.filter(r => filterStatus === 'all' || r.status === filterStatus);

  const leaderboard = Object.values(
    reports.reduce((acc: Record<string, any>, r) => {
      if (!acc[r.userId]) acc[r.userId] = {
        userId: r.userId, userName: r.userName,
        avatarSeed: r.avatarSeed, points: 0, total: 0, verified: 0,
      };
      acc[r.userId].points += r.pointsAwarded;
      acc[r.userId].total  += 1;
      if (r.status !== 'pending') acc[r.userId].verified += 1;
      return acc;
    }, {})
  ).sort((a: any, b: any) => b.points - a.points);

  const myReports  = reports.filter(r => r.userId === userId);
  const myVerified = myReports.filter(r => r.status !== 'pending').length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter neon-text">Community</h1>
          <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest mt-1">
            Report overflowing bins · Earn points · Win badges
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-6 py-3 bg-cyber-accent hover:bg-cyber-accent/90 text-white rounded-xl font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)] flex items-center gap-2 self-start md:self-auto"
        >
          <Camera className="w-4 h-4" />Report a Bin
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Your Points',   value: stats.points,        color: 'text-cyber-accent'  },
          { label: 'Reports Filed', value: stats.total,         color: 'text-white'         },
          { label: 'Verified',      value: stats.verified,      color: 'text-cyber-success' },
          { label: 'Badges Earned', value: stats.badges.length, color: 'text-cyber-warning' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-panel p-5 border-white/5 text-center"
          >
            <p className={`text-2xl font-display font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
        {([
          { key: 'feed',        label: 'Live Feed'   },
          { key: 'leaderboard', label: 'Leaderboard' },
          { key: 'mybadges',    label: 'My Badges'   },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-[10px] font-display font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? 'bg-cyber-accent text-white shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">

        {/* FEED */}
        {activeTab === 'feed' && (
          <motion.div key="feed" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="flex gap-2 mb-6 flex-wrap items-center">
              {(['all', 'pending', 'verified', 'resolved'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-4 py-2 rounded-full text-[10px] font-display font-bold uppercase tracking-widest border transition-all ${
                    filterStatus === f
                      ? 'bg-cyber-accent/10 border-cyber-accent/40 text-cyber-accent'
                      : 'border-white/10 text-slate-500 hover:text-white hover:border-white/20'
                  }`}
                >
                  {f === 'all' ? 'All reports' : f}
                </button>
              ))}
              <span className="ml-auto text-[10px] font-display text-slate-500 uppercase tracking-widest self-center">
                {filteredReports.length} reports
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredReports.map(r => (
                  <ReportCard key={r.id} report={r} onUpvote={upvoteReport} isOwn={r.userId === userId} />
                ))}
              </AnimatePresence>
              {filteredReports.length === 0 && (
                <div className="col-span-3 glass-panel p-16 border-white/5 text-center">
                  <ImageIcon className="w-10 h-10 text-slate-700 mx-auto mb-4 opacity-20" />
                  <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">No reports found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <motion.div key="lb" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="glass-panel border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-cyber-warning" />
              <h2 className="text-sm font-display font-bold text-white uppercase tracking-widest">Top Contributors This Month</h2>
            </div>

            {leaderboard.length >= 3 && (
              <div className="p-8 border-b border-white/5">
                <div className="flex items-end justify-center gap-4">
                  {/* 2nd */}
                  <div className="flex flex-col items-center gap-2 pb-2">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-400/40 bg-white/5 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-white">{(leaderboard[1] as any).userName.split(' ')[0]}</p>
                    <p className="text-[10px] font-mono text-slate-400">{(leaderboard[1] as any).points} pts</p>
                    <div className="w-16 h-16 bg-slate-400/10 border border-slate-400/20 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-slate-400 font-display font-black text-lg">2</span>
                    </div>
                  </div>
                  {/* 1st */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl">👑</div>
                    <div className="w-16 h-16 rounded-full border-2 border-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.3)] bg-yellow-400/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-yellow-400" />
                    </div>
                    <p className="text-sm font-bold text-white">{(leaderboard[0] as any).userName.split(' ')[0]}</p>
                    <p className="text-[10px] font-mono text-yellow-400">{(leaderboard[0] as any).points} pts</p>
                    <div className="w-16 h-24 bg-yellow-400/10 border border-yellow-400/20 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-yellow-400 font-display font-black text-lg">1</span>
                    </div>
                  </div>
                  {/* 3rd */}
                  <div className="flex flex-col items-center gap-2 pb-2">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-700/40 bg-white/5 flex items-center justify-center">
                      <User className="w-5 h-5 text-amber-700" />
                    </div>
                    <p className="text-xs font-bold text-white">{(leaderboard[2] as any).userName.split(' ')[0]}</p>
                    <p className="text-[10px] font-mono text-amber-700">{(leaderboard[2] as any).points} pts</p>
                    <div className="w-16 h-10 bg-amber-700/10 border border-amber-700/20 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-amber-700 font-display font-black text-lg">3</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="divide-y divide-white/5">
              {leaderboard.map((entry: any, idx: number) => (
                <div key={entry.userId}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors ${entry.userId === userId ? 'bg-cyber-accent/5' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-black flex-shrink-0 ${
                    idx === 0 ? 'bg-yellow-400/20 text-yellow-400' :
                    idx === 1 ? 'bg-slate-400/20 text-slate-400'   :
                    idx === 2 ? 'bg-amber-700/20 text-amber-700'   :
                    'bg-white/5 text-slate-500'
                  }`}>{idx + 1}</div>
                  <div className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {entry.userName}
                      {entry.userId === userId && <span className="ml-2 text-cyber-accent text-[10px] font-display">(you)</span>}
                    </p>
                    <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">
                      {entry.total} reports · {entry.verified} verified
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {BADGES.filter(b => entry.verified >= b.requirement).slice(-3).map(b => (
                      <span key={b.id} className="text-base" title={b.name}>{b.icon}</span>
                    ))}
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[48px]">
                    <p className="text-sm font-display font-black text-cyber-accent">{entry.points}</p>
                    <p className="text-[9px] font-display text-slate-500 uppercase tracking-widest">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* MY BADGES */}
        {activeTab === 'mybadges' && (
          <motion.div key="badges" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-6">
            {stats.badges.length > 0 && (
              <div className="glass-panel p-6 border-cyber-accent/20">
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyber-accent" />Badges Earned
                </h3>
                <div className="flex gap-4 flex-wrap">
                  {stats.badges.map(b => (
                    <div key={b.id} className="flex flex-col items-center gap-2 p-4 bg-cyber-accent/5 border border-cyber-accent/20 rounded-xl min-w-[80px]">
                      <span className="text-3xl">{b.icon}</span>
                      <p className="text-[10px] font-display font-bold text-white uppercase tracking-widest text-center">{b.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BADGES.map(badge => {
                const earned   = myVerified >= badge.requirement;
                const progress = Math.min((myVerified / badge.requirement) * 100, 100);
                return (
                  <motion.div key={badge.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className={`glass-panel p-6 border transition-all ${earned ? 'border-cyber-accent/30 bg-cyber-accent/5' : 'border-white/5'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`text-4xl ${earned ? '' : 'grayscale opacity-30'}`}>{badge.icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-display font-bold uppercase tracking-widest ${earned ? 'text-white' : 'text-slate-500'}`}>{badge.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{badge.description}</p>
                      </div>
                      {earned && <CheckCircle className="w-5 h-5 text-cyber-success flex-shrink-0" />}
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full transition-all duration-700 ${earned ? 'bg-cyber-accent' : 'bg-slate-700'}`}
                        style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[9px] font-display text-slate-500 uppercase tracking-widest">
                      {Math.min(myVerified, badge.requirement)} / {badge.requirement} verified reports
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div className="glass-panel p-6 border-white/5">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Star className="w-4 h-4 text-cyber-warning" />How Points Work
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Submit a report', points: POINTS_PER_REPORT,   color: 'text-white',         desc: 'Awarded immediately on submission' },
                  { label: 'Report verified', points: POINTS_PER_VERIFIED, color: 'text-cyber-accent',  desc: 'Admin confirms your report'        },
                  { label: 'Issue resolved',  points: POINTS_PER_RESOLVED, color: 'text-cyber-success', desc: 'Bin is collected or fixed'          },
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-white/5 rounded-xl border border-white/5">
                    <p className={`text-2xl font-display font-black mb-1 ${item.color}`}>+{item.points}</p>
                    <p className="text-xs font-bold text-white mb-1">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsUploadOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit   ={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-panel p-8 border-cyber-accent/30 shadow-[0_0_50px_rgba(0,243,255,0.15)] max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <AnimatePresence>
                {submitSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 z-10 bg-cyber-bg/96 flex flex-col items-center justify-center rounded-2xl">
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                      <CheckCircle className="w-20 h-20 text-cyber-success mb-6" />
                    </motion.div>
                    <p className="text-xl font-display font-bold text-white uppercase tracking-tighter mb-2">Report Submitted!</p>
                    <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest text-center">
                      +{POINTS_PER_REPORT} points awarded · Admins have been notified
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold text-white uppercase tracking-tighter flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-cyber-danger" />Report Overflow
                </h2>
                <button onClick={() => !isSubmitting && setIsUploadOpen(false)}
                  className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Image upload */}
                <div>
                  <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 mb-2 block">
                    Photo Evidence <span className="text-cyber-danger">*</span>
                  </label>
                  <div onClick={() => fileRef.current?.click()}
                    className={`relative cursor-pointer border-2 border-dashed rounded-xl transition-all overflow-hidden ${
                      preview ? 'border-cyber-accent/40' : 'border-white/10 hover:border-cyber-accent/30 hover:bg-white/[0.02]'
                    }`}>
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="Preview" className="w-full h-52 object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-[10px] font-display text-white uppercase tracking-widest flex items-center gap-2">
                            <Camera className="w-4 h-4" />Click to change photo
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-44 flex flex-col items-center justify-center gap-3 text-slate-500">
                        <Camera className="w-10 h-10 opacity-30" />
                        <div className="text-center">
                          <p className="text-[10px] font-display uppercase tracking-widest">Tap to take or upload a photo</p>
                          <p className="text-[9px] text-slate-600 mt-1">JPG, PNG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment"
                    onChange={handleFileChange} className="hidden" />
                </div>

                {/* Bin ID */}
                <div>
                  <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 mb-2 block">
                    Bin ID <span className="text-slate-600">(optional — check the label on the bin)</span>
                  </label>
                  <input type="text" value={binIdInput} onChange={e => setBinIdInput(e.target.value)}
                    placeholder="e.g. BIN-003" className="cyber-input w-full" />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 mb-2 block">
                    Description <span className="text-cyber-danger">*</span>
                  </label>
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the issue — overflowing, broken lid, wrong waste type, bad smell..."
                    className="cyber-input w-full resize-none" />
                </div>

                {/* Location */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-cyber-accent flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">Your location (auto-detected)</p>
                    <p className="text-xs text-white mt-0.5 font-mono">{userLoc?.address || 'Detecting...'}</p>
                  </div>
                </div>

                {/* Points preview */}
                <div className="p-4 bg-cyber-success/5 border border-cyber-success/20 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white mb-1">Instant reward</p>
                    <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">
                      +{POINTS_PER_VERIFIED} if verified · +{POINTS_PER_RESOLVED} if resolved
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-black text-cyber-success">+{POINTS_PER_REPORT}</p>
                    <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">points</p>
                  </div>
                </div>

                <button
                  onClick={handleSubmitReport}
                  disabled={!imageFile || !description.trim() || isSubmitting}
                  className="w-full py-4 bg-cyber-accent hover:bg-cyber-accent/90 text-white rounded-xl font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting & Notifying Admins...</>
                    : <><Upload className="w-4 h-4" />Submit Report</>
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}