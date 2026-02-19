
import React, { useState } from 'react';
import { Coffee, Github, Home, Sun, Moon, Users, Menu, X, RefreshCw, BarChart3, Loader2 } from 'lucide-react';
import { GitHubUser } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  user: GitHubUser | null;
  isDark: boolean;
  toggleTheme: (e?: any) => void;
  currentView: 'home' | 'followers' | 'stats';
  setView: (view: 'home' | 'followers' | 'stats') => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0, y: -60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", stiffness: 300, damping: 25, staggerChildren: 0.1, delayChildren: 0.4 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
};

const Navbar: React.FC<NavbarProps> = ({ user, isDark, toggleTheme, currentView, setView, onRefresh, isRefreshing }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSetView = (view: 'home' | 'followers' | 'stats') => {
      setView(view);
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
      { id: 'home', label: 'Cellar', icon: Home, action: () => handleSetView('home'), active: currentView === 'home' },
      { id: 'stats', label: 'Analytics', icon: BarChart3, action: () => handleSetView('stats'), active: currentView === 'stats' },
      { id: 'followers', label: 'Patrons', icon: Users, action: () => handleSetView('followers'), active: currentView === 'followers' },
  ];

  return (
    <nav className="fixed top-8 left-0 right-0 z-[100] px-6 md:px-12 pointer-events-none">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto liquid-glass-high rounded-full h-20 sm:h-24 flex items-center justify-between px-4 sm:px-10 pointer-events-auto"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-5 cursor-pointer group" onClick={() => handleSetView('home')}>
          <div className="relative">
            {user ? (
                <div className="relative">
                   <div className="absolute inset-0 bg-white/50 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <img className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-700 relative z-10" src={user.avatar_url} alt={user.login} />
                </div>
            ) : (
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/10 animate-pulse" />
            )}
            <motion.div 
              layoutId="status-dot"
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-4 border-white/80 dark:border-white/10 rounded-full z-20 shadow-lg" 
            />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-black text-sm tracking-tight text-coffee-950 dark:text-white leading-none mb-1">
              {user?.login || 'Grinding...'}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-coffee-500 dark:text-coffee-400">Master Roaster</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-coffee-950/5 dark:bg-white/5 p-1.5 rounded-full gap-1.5 border border-white/10 shadow-inner">
              {navLinks.map((link) => (
                  <motion.button 
                      key={link.label}
                      variants={itemVariants}
                      onClick={link.action}
                      className={`relative px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2.5 group overflow-hidden ${link.active ? 'text-white dark:text-coffee-950' : 'text-coffee-600 dark:text-coffee-300 hover:text-coffee-950 dark:hover:text-white'}`}
                  >
                    {link.active && (
                      <motion.div 
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-coffee-950 dark:bg-white z-0 rounded-full shadow-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2.5">
                      <link.icon size={15} strokeWidth={3} />
                      {link.label}
                    </span>
                  </motion.button>
              ))}
          </div>
          
          <motion.div variants={itemVariants} className="h-10 w-px bg-coffee-950/10 dark:bg-white/10 mx-3 hidden sm:block" />

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button 
              variants={itemVariants}
              disabled={isRefreshing}
              onClick={onRefresh} 
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-coffee-950 dark:text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 relative ${isRefreshing ? 'opacity-50' : ''}`}
            >
                {isRefreshing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <RefreshCw size={20} strokeWidth={2.5} />
                )}
            </motion.button>

            <motion.button 
              variants={itemVariants}
              onClick={(e) => toggleTheme(e)} 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full text-coffee-950 dark:text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
            >
                <motion.div 
                  initial={false}
                  animate={{ rotate: isDark ? 180 : 0 }} 
                >
                    {isDark ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
                </motion.div>
            </motion.button>

            <motion.button 
              variants={itemVariants}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden w-12 h-12 rounded-full text-coffee-950 dark:text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
            >
                {isMobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 25, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="md:hidden max-w-sm mx-auto liquid-glass-high rounded-4xl p-6 pointer-events-auto mt-4"
            >
                <div className="space-y-3">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={link.action}
                            className={`w-full flex items-center gap-5 px-8 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all ${
                                link.active 
                                ? 'bg-coffee-950 dark:bg-white text-white dark:text-coffee-950 shadow-lg' 
                                : 'text-coffee-600 dark:text-coffee-400 hover:bg-white/20'
                            }`}
                        >
                            <link.icon size={20} strokeWidth={3} />
                            {link.label}
                        </button>
                    ))}
                    <a 
                      href={`https://github.com/${user?.login}`} 
                      target="_blank" 
                      className="w-full flex items-center gap-5 px-8 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] text-coffee-400 border border-coffee-950/10 dark:border-white/10 mt-6 hover:bg-white/20"
                    >
                      <Github size={20} strokeWidth={3} />
                      Source
                    </a>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
