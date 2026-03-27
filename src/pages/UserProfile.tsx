import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Phone, MapPin, Shield, LogOut, Save, Edit2, Camera, Bell, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserProfile() {
  const { userEmail, userName, role, logout } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userName || 'User_089',
    email: userEmail || 'john.doe@example.com',
    phone: '+91 98765 43210',
    address: 'Connaught Place, New Delhi, 110001',
    bio: 'Environment enthusiast and active SwachhPath user.'
  });

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you'd call an API here
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="relative h-48 rounded-3xl overflow-hidden glass-panel border-cyber-accent/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,243,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,243,255,0.1)_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-bg via-transparent to-transparent"></div>
        
        <div className="absolute -bottom-12 left-8 flex items-end space-x-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-cyber-bg border-4 border-cyber-accent/30 overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.2)]">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-cyber-accent rounded-lg text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-14">
            <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tighter neon-text">{profileData.name}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className="px-2 py-0.5 bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30 rounded text-[10px] font-display uppercase tracking-widest">
                {role === 'admin' ? 'System Administrator' : 'Verified Citizen'}
              </span>
              <span className="text-[10px] font-display text-slate-500 uppercase tracking-widest flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1 text-cyber-success" />
                Account Secured
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
        {/* Left Column - Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 border-white/5"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest flex items-center">
                <User className="w-5 h-5 mr-3 text-cyber-accent" />
                {t('profile.title')}
              </h2>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="px-4 py-2 bg-cyber-accent/10 hover:bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/30 rounded-lg text-[10px] font-display font-bold uppercase tracking-widest transition-all flex items-center"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('profile.save')}
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t('profile.edit')}
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-display uppercase tracking-widest text-slate-500 mb-2">{t('profile.name')}</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="cyber-input w-full" 
                    />
                  ) : (
                    <p className="text-sm text-white font-medium">{profileData.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-display uppercase tracking-widest text-slate-500 mb-2">{t('profile.email')}</label>
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="cyber-input w-full" 
                    />
                  ) : (
                    <p className="text-sm text-white font-medium">{profileData.email}</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-display uppercase tracking-widest text-slate-500 mb-2">{t('profile.phone')}</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="cyber-input w-full" 
                    />
                  ) : (
                    <p className="text-sm text-white font-medium">{profileData.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-display uppercase tracking-widest text-slate-500 mb-2">{t('profile.address')}</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="cyber-input w-full" 
                    />
                  ) : (
                    <p className="text-sm text-white font-medium">{profileData.address}</p>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-display uppercase tracking-widest text-slate-500 mb-2">{t('profile.bio')}</label>
                {isEditing ? (
                  <textarea 
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    className="cyber-input w-full resize-none" 
                  />
                ) : (
                  <p className="text-sm text-slate-400 leading-relaxed">{profileData.bio}</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 border-white/5"
          >
            <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest flex items-center mb-8">
              <Bell className="w-5 h-5 mr-3 text-cyber-warning" />
              Notification Settings
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Critical Bin Alerts', desc: 'Notify when nearby bins exceed 80% capacity' },
                { label: 'System Updates', desc: 'Important announcements from MCD' },
                { label: 'Usage Reports', desc: 'Weekly summary of your environmental impact' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{item.desc}</p>
                  </div>
                  <div className="w-12 h-6 bg-cyber-accent/20 rounded-full relative cursor-pointer border border-cyber-accent/30">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-cyber-accent rounded-full shadow-[0_0_10px_rgba(0,243,255,0.5)]"></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 border-white/5"
          >
            <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest flex items-center mb-8">
              <Activity className="w-5 h-5 mr-3 text-cyber-success" />
              Your Impact
            </h2>
            <div className="space-y-6">
              <div className="text-center p-6 bg-cyber-success/5 border border-cyber-success/20 rounded-2xl">
                <p className="text-4xl font-display font-black text-cyber-success mb-1">124</p>
                <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">Bins Used</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-xl font-display font-bold text-white mb-1">12.5kg</p>
                  <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">Waste Sorted</p>
                </div>
                <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-xl font-display font-bold text-white mb-1">45km</p>
                  <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">Distance Saved</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 border-white/5"
          >
            <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest flex items-center mb-8">
              <Shield className="w-5 h-5 mr-3 text-cyber-danger" />
              Security
            </h2>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-display font-bold uppercase tracking-widest transition-all mb-4">
              Change Password
            </button>
            <button 
              onClick={logout}
              className="w-full py-3 bg-cyber-danger/10 hover:bg-cyber-danger/20 text-cyber-danger border border-cyber-danger/30 rounded-xl text-xs font-display font-bold uppercase tracking-widest transition-all flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
