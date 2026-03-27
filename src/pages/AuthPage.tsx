import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, User, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, error, isLoading } = useAuth();
  const { t } = useLanguage();
  
  const isAdmin = location.pathname.includes('admin');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password, isAdmin ? 'admin' : 'user');
      } else {
        await register(formData.email, formData.password, formData.name, isAdmin ? 'admin' : 'user');
      }
      navigate(isAdmin ? '/admin' : '/user');
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 border-white/5 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-accent/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="text-center mb-8 relative">
            <div className="inline-flex p-3 rounded-2xl bg-cyber-accent/10 border border-cyber-accent/20 mb-4">
              {isAdmin ? <Shield className="w-8 h-8 text-cyber-accent" /> : <User className="w-8 h-8 text-cyber-accent" />}
            </div>
            <h1 className="text-2xl font-display font-bold text-white uppercase tracking-tighter">
              {isAdmin ? t('auth.adminPortal') : (isLogin ? t('auth.userLogin') : t('auth.createAccount'))}
            </h1>
            <p className="text-xs text-slate-500 font-display uppercase tracking-widest mt-2">
              {isAdmin ? t('auth.secureAccess') : t('auth.accessSmartBins')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-cyber-danger/10 border border-cyber-danger/20 rounded-xl flex items-center text-xs text-cyber-danger font-display uppercase tracking-widest"
                >
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">{t('auth.fullName')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="cyber-input w-full pl-12"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">{t('auth.emailAddress')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="cyber-input w-full pl-12"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="cyber-input w-full pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-cyber-accent hover:bg-cyber-accent/90 text-white rounded-xl font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)] flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? t('auth.signIn') : t('auth.signUp')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-display uppercase tracking-widest text-slate-500 hover:text-cyber-accent transition-colors"
            >
              {isLogin ? t('auth.needAccount') : t('auth.alreadyHaveAccount')}
            </button>
          </div>

          {isAdmin && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/auth')}
                className="text-[10px] font-display uppercase tracking-widest text-cyber-accent/60 hover:text-cyber-accent transition-colors"
              >
                {t('auth.backToUserLogin')}
              </button>
            </div>
          )}
          {!isAdmin && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/admin/auth')}
                className="text-[10px] font-display uppercase tracking-widest text-cyber-accent/60 hover:text-cyber-accent transition-colors"
              >
                {t('auth.adminLogin')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
