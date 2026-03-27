import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trash2, 
  MapPin, 
  Navigation, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Globe,
  Activity,
  Cpu,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { t } = useLanguage();
  const { isAuthenticated, role } = useAuth();

  const features = [
    { icon: Zap, title: t('landing.iotIntegration'), desc: t('landing.iotDesc') },
    { icon: Activity, title: t('landing.realTimeAnalytics'), desc: t('landing.analyticsDesc') },
    { icon: Navigation, title: t('landing.routeOptimization'), desc: t('landing.routeDesc') },
  ];

  const steps = [
    { title: t('landing.step1Title'), desc: t('landing.step1Desc') },
    { title: t('landing.step2Title'), desc: t('landing.step2Desc') },
    { title: t('landing.step3Title'), desc: t('landing.step3Desc') },
  ];

  return (
    <div className="space-y-32 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center pt-20">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-accent/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-danger/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-accent/10 border border-cyber-accent/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-cyber-accent animate-ping"></span>
              <span className="text-[10px] font-display font-bold text-cyber-accent uppercase tracking-widest">{t('landing.smartDelhi')}</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
              {t('landing.welcome')} <br />
              <span className="neon-text">{t('app.name')}</span>
            </h1>
            
            <p className="text-lg text-slate-400 font-medium leading-relaxed mb-10 max-w-lg">
              {t('landing.tagline')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to={isAuthenticated ? "/user" : "/auth"}
                className="px-8 py-4 bg-cyber-accent hover:bg-cyber-accent/90 text-white rounded-xl font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(0,243,255,0.3)] flex items-center group"
              >
                {t('landing.findBins')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              {(!isAuthenticated || role === 'admin') && (
                <Link
                  to={isAuthenticated ? "/admin" : "/admin/auth"}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-display font-bold uppercase tracking-widest transition-all"
                >
                  {t('landing.adminDash')}
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="glass-panel p-4 border-white/5 relative z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-accent/20 to-transparent opacity-50"></div>
              <img 
                src="https://picsum.photos/seed/smartcity/800/600" 
                alt="Smart City" 
                className="rounded-xl w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating UI Elements */}
              <div className="absolute -top-8 -right-8 glass-panel p-4 border-cyber-accent/30 shadow-2xl animate-bounce-slow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-cyber-accent/20 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-cyber-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">{t('landing.routeOptimized')}</p>
                    <p className="text-xs font-bold text-white">{t('landing.saveKm')}</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-8 glass-panel p-4 border-cyber-danger/30 shadow-2xl animate-bounce-slow delay-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-cyber-danger/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-cyber-danger" />
                  </div>
                  <div>
                    <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest">{t('landing.binFull')}</p>
                    <p className="text-xs font-bold text-white">{t('landing.chandniChowk')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2 }}
            className="glass-panel p-8 border-white/5 hover:border-cyber-accent/30 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:border-cyber-accent/50 transition-all">
              <feature.icon className="w-7 h-7 text-cyber-accent" />
            </div>
            <h3 className="text-xl font-display font-bold text-white uppercase tracking-tighter mb-4">{feature.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* How it Works */}
      <section className="relative py-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter mb-4">{t('landing.howItWorks')}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">{t('landing.howItWorksDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-4 -top-4 text-8xl font-display font-black text-white/5 group-hover:text-cyber-accent/10 transition-colors">
                0{idx + 1}
              </div>
              <div className="relative pt-8">
                <h4 className="text-xl font-display font-bold text-white uppercase tracking-tighter mb-4">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="glass-panel p-8 md:p-16 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-accent/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">
          <div>
            <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter mb-6">{t('landing.getInTouch')}</h2>
            <p className="text-slate-500 mb-12 leading-relaxed">
              {t('landing.contactDesc')}
            </p>

            <div className="space-y-8">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-cyber-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest mb-1">{t('landing.address')}</p>
                  <p className="text-sm font-bold text-white">MCD Civic Centre, New Delhi</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-cyber-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest mb-1">{t('landing.phone')}</p>
                  <p className="text-sm font-bold text-white">+91 11 2322 0010</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-cyber-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest mb-1">{t('landing.email')}</p>
                  <p className="text-sm font-bold text-white">contact@swachhpath.gov.in</p>
                </div>
              </div>
            </div>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">{t('landing.firstName')}</label>
                <input type="text" className="cyber-input w-full" placeholder="Shraddha" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">{t('landing.lastName')}</label>
                <input type="text" className="cyber-input w-full" placeholder="Sajwan" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">{t('landing.emailAddress')}</label>
              <input type="email" className="cyber-input w-full" placeholder="shraddha@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-display uppercase tracking-widest text-slate-500 ml-1">{t('landing.message')}</label>
              <textarea rows={4} className="cyber-input w-full resize-none" placeholder="How can we help?"></textarea>
            </div>
            <button className="w-full py-4 bg-cyber-accent hover:bg-cyber-accent/90 text-white rounded-xl font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)]">
              {t('landing.sendBtn')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
