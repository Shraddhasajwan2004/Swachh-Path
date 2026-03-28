import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trash2, 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Languages,
  Type,
  ChevronDown,
  Shield,
  Home,
  Contrast
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, role, logout, userName } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/user', label: t('nav.user'), icon: Trash2 },
    { path: '/admin', label: t('nav.admin'), icon: LayoutDashboard, adminOnly: true },
  ];

  const filteredNav = navItems.filter(item => !item.adminOnly || role === 'admin');

  // Theme cycle: dark → light → contrast → dark
  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('contrast');
    else setTheme('dark');
  };

  // Icon for current theme (shows what clicking will switch TO)
  const ThemeIcon = () => {
    if (theme === 'dark') return <Sun className="w-5 h-5" />;
    if (theme === 'light') return <Moon className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;  // contrast → back to dark
  };

  // Label showing current active theme
  const themeLabel = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'Contrast';

  return (
    <div className="min-h-screen font-sans selection:bg-cyber-accent/30 selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-cyber-accent/10 border border-cyber-accent/20 flex items-center justify-center group-hover:border-cyber-accent/50 transition-all shadow-[0_0_15px_rgba(0,243,255,0.1)]">
              <Trash2 className="w-6 h-6 text-cyber-accent" />
            </div>
            <span className="text-xl font-display font-black text-white uppercase tracking-tighter neon-text">
              {t('app.name')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[10px] font-display font-bold uppercase tracking-widest transition-all hover:text-cyber-accent ${
                  location.pathname === item.path ? 'text-cyber-accent' : 'text-slate-500'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-cyber-accent transition-all flex items-center space-x-2"
              title="Translate"
            >
              <Type className="w-5 h-5" />
              <span className="text-[10px] font-display font-bold uppercase tracking-widest">
                {language === 'en' ? 'English' : 'हिंदी'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-cyber-accent transition-all flex items-center space-x-2"
              title={`Current: ${themeLabel} — click to cycle`}
            >
              <ThemeIcon />
              <span className="hidden lg:block text-[10px] font-display font-bold uppercase tracking-widest">
                {themeLabel}
              </span>
            </button>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-1 pr-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyber-accent/30 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyber-accent/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-cyber-accent" />
                  </div>
                  <span className="hidden lg:block text-[10px] font-display font-bold text-white uppercase tracking-widest">
                    {userName || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 z-50 glass-panel border-white/10 p-2 shadow-2xl"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-[10px] font-display font-bold uppercase tracking-widest">{t('profile.title')}</span>
                        </Link>
                        {role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                          >
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-display font-bold uppercase tracking-widest">Admin</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-cyber-danger/10 text-slate-400 hover:text-cyber-danger transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-[10px] font-display font-bold uppercase tracking-widest">Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-6 py-2 bg-cyber-accent/10 hover:bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/30 rounded-xl text-[10px] font-display font-bold uppercase tracking-widest transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-slate-500"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-1">
                {filteredNav.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 p-4 rounded-xl transition-all ${
                      location.pathname === item.path ? 'bg-cyber-accent/10 text-cyber-accent' : 'text-slate-500 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest">{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Trash2 className="w-8 h-8 text-cyber-accent" />
              <span className="text-2xl font-display font-black text-white uppercase tracking-tighter">
                {t('app.name')}
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">
              A smart waste management initiative by MCD. Utilizing IoT and real-time data to create a cleaner, greener Delhi for all citizens.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-display font-bold text-white uppercase tracking-widest mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {filteredNav.map(item => (
                <li key={item.path}>
                  <Link to={item.path} className="text-xs text-slate-500 hover:text-cyber-accent transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-display font-bold text-white uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-xs text-slate-500 hover:text-cyber-accent transition-colors">Help Center</a></li>
              <li><a href="#" className="text-xs text-slate-500 hover:text-cyber-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-xs text-slate-500 hover:text-cyber-accent transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">
            © 2024 SwachhPath. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <span className="text-[10px] font-display text-slate-700 uppercase tracking-widest">Version 2.0.4-stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}