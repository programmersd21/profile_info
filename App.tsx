
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, RefreshCw, Coffee, Github, Loader2, AlertCircle, Clock, Zap } from 'lucide-react';
import { getPortfolioData, RateLimitError } from './services/githubService';
import { GitHubUser, GitHubRepo, CoffeeStats } from './types';
import CoffeeLoader from './components/CoffeeLoader';
import Navbar from './components/Navbar';
import ProfileHero from './components/ProfileHero';
import RepoGrid from './components/RepoGrid';
import FollowersList from './components/FollowersList';
import StatsPage from './components/StatsPage';

const springConfig = { type: "spring", stiffness: 200, damping: 25 };

// Optimized View Variants
const viewVariants = {
  initial: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 1.02, filter: "blur(10px)", transition: { duration: 0.4, ease: "easeInOut" } }
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<GitHubRepo[]>([]);
  const [followers, setFollowers] = useState<GitHubUser[]>([]);
  const [tags, setTags] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<CoffeeStats | null>(null);
  const [error, setError] = useState<{ message: string; resetAt?: number; startAt?: number } | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'followers' | 'stats'>('home');
  const [isDark, setIsDark] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [ripple, setRipple] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false });
  const [countdown, setCountdown] = useState<string>('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = useCallback(async (isInitial: boolean = false, forceRefresh: boolean = false) => {
    if (isInitial) setLoading(true);
    else setBackgroundRefreshing(true);
    
    const minLoadTime = isInitial ? new Promise(resolve => setTimeout(resolve, 2000)) : Promise.resolve();

    try {
      const data = await getPortfolioData(forceRefresh);
      await minLoadTime;
      setUser(data.user);
      setRepos(data.repos);
      setPinnedRepos(data.pinnedRepos);
      setFollowers(data.followers);
      setTags(data.tags || {});
      setStats(data.stats);
      setError(null);
    } catch (err: any) {
      console.error(err);
      if (err instanceof RateLimitError) {
        setError({ 
          message: err.message, 
          resetAt: err.resetTime,
          startAt: Math.floor(Date.now() / 1000)
        });
      } else {
        setError({ message: "Unable to fetch data. Check your connection." });
      }
    } finally {
      if (isInitial) setLoading(false);
      setBackgroundRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(true); }, [loadData]);

  // Automatic retry logic for rate limits
  useEffect(() => {
    if (error?.resetAt) {
      const timer = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = error.resetAt! - now;
        
        if (remaining <= 0) {
          clearInterval(timer);
          setError(null);
          loadData(true);
        } else {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          
          if (error.startAt) {
            const total = error.resetAt! - error.startAt;
            const elapsed = now - error.startAt;
            setProgress(Math.min(100, (elapsed / total) * 100));
          }
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [error, loadData]);

  const toggleTheme = (event?: any) => {
    const x = event?.clientX || window.innerWidth / 2;
    const y = event?.clientY || 60;
    setRipple({ x, y, show: true });
    setTimeout(() => {
      const nextMode = !isDark;
      setIsDark(nextMode);
      document.documentElement.classList.toggle('dark', nextMode);
      setTimeout(() => setRipple(prev => ({ ...prev, show: false })), 800);
    }, 10);
  };

  return (
    <>
      <AnimatePresence>
        {ripple.show && (
          <motion.div
            initial={{ clipPath: `circle(0% at ${ripple.x}px ${ripple.y}px)` }}
            animate={{ clipPath: `circle(150% at ${ripple.x}px ${ripple.y}px)` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[1000] bg-coffee-950 dark:bg-white pointer-events-none opacity-10 mix-blend-overlay"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {loading && !error && (
          <motion.div key="loader" exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }} transition={{ duration: 0.8 }} className="fixed inset-0 z-[200]">
            <CoffeeLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Liquid Background - CSS Driven for Performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-coffee-200/40 to-coffee-300/40 dark:from-coffee-900/40 dark:to-black blur-[120px] opacity-60 animate-blob" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tl from-coffee-400/30 to-amber-200/20 dark:from-coffee-800/20 dark:to-coffee-950 blur-[100px] opacity-50 animate-blob" style={{ animationDelay: '5s' }} />
      </div>

      <AnimatePresence>
        {error && !user && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[300] bg-white/50 dark:bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
             {/* Error Component content unchanged for brevity, reusing existing structure */}
             <div className="max-w-md w-full space-y-12">
                <div className="relative inline-block">
                  <motion.div 
                    animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="liquid-glass-high p-8 rounded-[3rem] relative z-10"
                  >
                    <Coffee size={64} className="text-coffee-600 dark:text-coffee-400 mx-auto" />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-serif font-black italic text-coffee-950 dark:text-white">Barista is on break</h2>
                  <p className="text-coffee-500 dark:text-coffee-400 font-medium leading-relaxed italic">
                    GitHub's machine needs to cool down. We're currently waiting for a fresh batch of API credits.
                  </p>
                </div>
                {error.resetAt && (
                  <div className="space-y-8 liquid-glass p-10 rounded-[2.5rem]">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-coffee-600 dark:text-coffee-300">Brewing Restart</span>
                       <span className="text-2xl font-mono font-black text-coffee-800 dark:text-coffee-100">{countdown}</span>
                    </div>
                    <div className="h-2 w-full bg-coffee-100/50 dark:bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-coffee-600 dark:bg-coffee-400 shadow-[0_0_15px_rgba(140,94,60,0.5)]" 
                       />
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => loadData(true, true)}
                  className="flex items-center gap-3 mx-auto px-8 py-4 bg-coffee-950 dark:bg-white text-white dark:text-coffee-950 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Check Early <RefreshCw size={14} />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && user && (
        <div className="min-h-screen transition-colors duration-1000 overflow-x-hidden relative z-10">
          <Navbar 
            user={user} isDark={isDark} toggleTheme={toggleTheme} 
            currentView={currentView} setView={setCurrentView}
            onRefresh={() => loadData(false, true)}
            isRefreshing={backgroundRefreshing}
          />
          
          <main className="relative pt-10">
            <AnimatePresence>
              {error && user && (
                <motion.div 
                  initial={{ opacity: 0, y: 50, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 50, x: "-50%" }}
                  className="fixed bottom-10 left-1/2 z-[400] liquid-glass-high p-6 pr-10 rounded-[2rem] border-l-4 border-amber-500 shadow-2xl flex items-center gap-5 min-w-[320px]"
                >
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full">
                    <AlertCircle className="text-amber-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">Rate Limit Active</p>
                    <p className="text-xs font-bold text-coffee-800 dark:text-coffee-200">Refilling in {countdown}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-coffee-400 hover:text-coffee-950 dark:hover:text-white">
                    <RefreshCw size={14} className="animate-spin" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {currentView === 'home' && (
                <motion.div key="home" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                  <ProfileHero user={user} setView={setCurrentView} />
                  <RepoGrid repos={repos} pinnedRepos={pinnedRepos} tags={tags} />
                </motion.div>
              )}
              {currentView === 'followers' && (
                <motion.div key="followers" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                  <FollowersList followers={followers} />
                </motion.div>
              )}
              {currentView === 'stats' && stats && (
                <motion.div key="stats" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                  <StatsPage stats={stats} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <footer className="py-32 text-center relative overflow-hidden mt-20">
            <div className="absolute inset-0 bg-gradient-to-t from-coffee-100/50 to-transparent dark:from-black/50 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 relative z-10">
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 className="font-serif italic text-coffee-950/20 dark:text-white/20 text-5xl md:text-7xl mb-6 tracking-tighter"
               >
                 pro-grammer-SD
               </motion.p>
               <p className="text-[10px] tracking-[0.6em] font-black uppercase mb-12 text-coffee-500">
                 Brewed with pure intent &copy; {new Date().getFullYear()}
               </p>
               <div className="flex justify-center items-center gap-8">
                  <div className="w-24 h-px bg-coffee-200 dark:bg-white/10" />
                  <motion.div 
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 1 }}
                    className="text-coffee-400 cursor-pointer"
                  >
                    <Coffee size={32} />
                  </motion.div>
                  <div className="w-24 h-px bg-coffee-200 dark:bg-white/10" />
               </div>
            </div>
          </footer>

          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-10 right-10 p-5 liquid-glass-high rounded-full shadow-2xl z-[150] hover:scale-110 active:scale-90 transition-all group text-coffee-950 dark:text-white"
              >
                <ChevronUp size={28} strokeWidth={3} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default App;
