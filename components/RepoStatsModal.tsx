
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, AlertCircle, Info, Coffee, Clock, Zap, Loader2 } from 'lucide-react';
import { GitHubRepo } from '../types';
import { fetchRepoParticipation } from '../services/githubService';
import lottie from 'lottie-web';

interface RepoStatsModalProps {
  repo: GitHubRepo;
  onClose: () => void;
}

const RepoStatsModal: React.FC<RepoStatsModalProps> = ({ repo, onClose }) => {
  const [data, setData] = useState<{ all: number[], owner: number[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const lottieContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const loadStats = async () => {
      setLoading(true);
      try {
        const stats = await fetchRepoParticipation(repo.name);
        
        if (!mounted) return;

        // If stats are null (GitHub returning 202 while calculating), retry a few times
        if (!stats && retryCount < 3) {
            timeoutId = setTimeout(() => {
                setRetryCount(prev => prev + 1);
            }, 2000); // Wait 2s before retrying
            return;
        }

        setData(stats);
        setLoading(false);
      } catch (e) {
        if (mounted) setLoading(false);
      }
    };

    loadStats();

    return () => { 
        mounted = false;
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [repo.name, retryCount]);

  const { maxCommit, totalCommits, hasActivity, activityArray } = useMemo(() => {
    // Ensure we have a valid array of 52 weeks
    const allStats = data?.all && Array.isArray(data.all) ? data.all : [];
    
    // If empty or null, return defaults
    if (allStats.length === 0) return { maxCommit: 1, totalCommits: 0, hasActivity: false, activityArray: [] };

    const total = allStats.reduce((a, b) => a + b, 0);
    return {
      maxCommit: Math.max(...allStats, 1),
      totalCommits: total,
      hasActivity: total > 0,
      activityArray: allStats
    };
  }, [data]);

  // Load Lottie for Empty State
  useEffect(() => {
    if (!loading && !hasActivity && lottieContainer.current) {
        // Use the specific Lottie URL requested (Steaming Coffee/Beans vibe)
        const anim = lottie.loadAnimation({
            container: lottieContainer.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'https://lottie.host/8c158572-8848-4394-811c-66885834863e/5A2Y7t3f00.json' 
        });
        return () => anim.destroy();
    }
  }, [loading, hasActivity]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Heavy Backdrop Blur for Focus */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        onClick={onClose}
        className="absolute inset-0 bg-coffee-950/30 dark:bg-black/60 z-0 transition-all duration-700"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-[95%] sm:max-w-2xl liquid-glass-high rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] z-10"
        style={{ perspective: '1000px' }}
      >
        {/* Top Highlight Stripe */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/80 to-white/0 opacity-50 z-20 mix-blend-overlay" />
        
        <div className="overflow-y-auto overflow-x-hidden custom-scrollbar p-6 sm:p-12 flex flex-col h-full relative z-20">
            <div className="flex justify-between items-start mb-8 shrink-0">
                <div className="pr-4">
                    <div className="flex items-center gap-2 text-coffee-600 dark:text-coffee-300 mb-2">
                        <Activity size={16} className="animate-pulse text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Extraction Analysis</span>
                    </div>
                    <h3 className="text-2xl sm:text-4xl font-serif font-black text-coffee-950 dark:text-white tracking-tighter leading-none italic">
                      {repo.name}
                    </h3>
                </div>
                <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-coffee-950/5 dark:bg-white/10 text-coffee-950 dark:text-white hover:bg-coffee-950 hover:text-white dark:hover:bg-white dark:hover:text-coffee-950 transition-all active:scale-90 flex items-center justify-center flex-shrink-0 backdrop-blur-md"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="min-h-[220px] sm:min-h-[300px] flex flex-col liquid-glass rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 relative shrink-0 shadow-inner">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                          <Loader2 size={48} className="animate-spin text-coffee-400" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-2 h-2 bg-coffee-600 rounded-full animate-ping" />
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-coffee-400 uppercase tracking-[0.4em] animate-pulse">Brewing Data...</span>
                    </div>
                ) : hasActivity ? (
                    <div className="w-full h-full flex flex-col justify-end">
                        {/* Bar Graph */}
                        <div className="w-full h-[140px] sm:h-56 flex items-end justify-between gap-[2px] sm:gap-[3px] pt-4 shrink-0">
                            {activityArray.map((count, i) => {
                                const heightPercent = maxCommit > 0 ? (count / maxCommit) * 100 : 0;
                                const visualHeight = count > 0 ? Math.max(heightPercent, 5) : 3;
                                
                                return (
                                    <div key={i} className="flex-1 h-full flex flex-col justify-end group relative">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${visualHeight}%` }}
                                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: i * 0.01 }}
                                            className={`w-full rounded-[1px] sm:rounded-[2px] transition-all duration-300 ${
                                            count > 0 
                                            ? 'bg-gradient-to-t from-coffee-900 via-coffee-600 to-amber-500 dark:from-coffee-400 dark:via-coffee-300 dark:to-white opacity-80 hover:opacity-100 hover:scale-x-150' 
                                            : 'bg-coffee-950/5 dark:bg-white/5'
                                            }`}
                                        />
                                        
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-coffee-950/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-coffee-950 text-[10px] rounded-lg py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-bold shadow-xl">
                                            {count} commits
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 sm:mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-coffee-400/60 pt-4 border-t border-coffee-950/5 dark:border-white/5">
                            <span>1 Year Ago</span>
                            <span>Today</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <div ref={lottieContainer} className="w-48 h-48 sm:w-64 sm:h-64 -my-4" />
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                            <h4 className="text-coffee-950 dark:text-white font-serif font-black text-2xl mb-2 italic">Tranquil Roast</h4>
                            <p className="text-coffee-500 dark:text-coffee-300 text-xs max-w-[240px] leading-relaxed mx-auto">
                                No commit activity detected in the active cycle. The machine is idling at optimal temperature.
                            </p>
                        </motion.div>
                    </div>
                )}
            </div>

            <div className="mt-6 sm:mt-10 grid grid-cols-1 xs:grid-cols-2 gap-4 shrink-0">
                 <div className="p-6 liquid-glass rounded-3xl flex items-center gap-4 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-default">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Activity size={20} />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-coffee-400 mb-1">Total Yield</div>
                        <div className="text-3xl font-black text-coffee-950 dark:text-white leading-none">
                            {loading ? '-' : totalCommits}
                        </div>
                    </div>
                 </div>
                 <div className="p-6 liquid-glass rounded-3xl flex items-center gap-4 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-default">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Zap size={20} />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-coffee-400 mb-1">Avg Intensity</div>
                        <div className="text-3xl font-black text-coffee-950 dark:text-white leading-none">
                            {loading ? '-' : (totalCommits / 52).toFixed(1)}
                        </div>
                    </div>
                 </div>
            </div>
            
            <div className="mt-6 px-6 py-4 liquid-glass rounded-2xl flex items-center gap-4 shrink-0 opacity-80">
              <Info size={16} className="text-coffee-400 flex-shrink-0" />
              <p className="text-[10px] text-coffee-600 dark:text-coffee-300 font-medium leading-relaxed">
                Visualization reflects main branch commits over the trailing 52-week period. Data cached for performance.
              </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RepoStatsModal;
