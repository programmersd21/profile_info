
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GitFork, GitBranch, ChevronDown, Sparkles, ExternalLink, CircleDot, Loader2, Copy, Check, BarChart2, Coffee } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { GitHubRepo } from '../types';
import { fetchReadme, analyzeRepo } from '../services/githubService';
import RepoStatsModal from './RepoStatsModal';

interface RepoCardProps {
  repo: GitHubRepo;
  isPinned?: boolean;
  onTopicClick?: (topic: string) => void;
  selectedTopic?: string | null;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, isPinned = false, onTopicClick, selectedTopic }) => {
  const [expanded, setExpanded] = useState(false);
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeBranch, setReadmeBranch] = useState<string>('main');
  const [loadingReadme, setLoadingReadme] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const analysis = analyzeRepo(repo);

  const toggleExpand = async () => {
    if (!expanded && !readme) {
      setLoadingReadme(true);
      const result = await fetchReadme(repo.name, repo.default_branch);
      if (result) {
          setReadme(result.content);
          setReadmeBranch(result.branch);
      } else {
          setReadme('No README found.');
      }
      setLoadingReadme(false);
    }
    setExpanded(!expanded);
  };

  const copyCloneUrl = () => {
    navigator.clipboard.writeText(`git clone ${repo.clone_url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const transformImageUri = (uri: string) => {
      if (uri.startsWith('http') || uri.startsWith('//') || uri.startsWith('data:')) return uri;
      const cleanPath = uri.replace(/^\.?\//, '');
      return `https://raw.githubusercontent.com/${repo.full_name}/${readmeBranch}/${cleanPath}`;
  };

  return (
    <>
      <motion.div 
        layout="position"
        // Force hardware acceleration for smoother hover
        style={{ willChange: "transform" }}
        whileHover={{ y: -8, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`group rounded-[2.5rem] overflow-hidden flex flex-col relative transition-colors duration-500 h-full liquid-glass ${
          isPinned ? 'border-2 border-amber-500/20' : ''
        }`}
      >
        {/* Subtle hover highlighting within the glass */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Visual Preview */}
        {repo.repoImage && (
          <div className="relative h-56 sm:h-64 overflow-hidden bg-coffee-100 dark:bg-zinc-900">
            <AnimatePresence mode="popLayout">
              {!imgLoaded && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-br from-coffee-100 to-coffee-200 dark:from-zinc-900 dark:to-zinc-850 animate-pulse-slow flex flex-col items-center justify-center text-coffee-400 gap-2"
                >
                  <Coffee size={24} className="animate-spin text-coffee-400" />
                  <span className="text-[8px] font-black tracking-widest uppercase">Decanting Preview...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.img 
              src={repo.repoImage} 
              alt={repo.name} 
              onLoad={() => setImgLoaded(true)}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: imgLoaded ? 1 : 0, scale: imgLoaded ? 1 : 1.05 }}
              transition={{ duration: 0.6 }}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-black/80 via-transparent to-transparent" />
            
            <div className="absolute top-6 left-6 flex items-center gap-3">
              {isPinned && (
                <div className="liquid-glass-high text-coffee-950 dark:text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <Sparkles size={12} className="text-amber-500" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase">Signature</span>
                </div>
              )}
            </div>

            {/* Float Stat - Star Count */}
            <div className="absolute bottom-6 right-6">
              <div className="liquid-glass-high p-4 rounded-3xl flex flex-col items-center min-w-[70px]">
                <motion.div
                  key={`star-icon-${repo.stargazers_count}`}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Star size={20} className="text-amber-500 mb-1 fill-amber-500" />
                </motion.div>
                <motion.span 
                  key={`star-count-${repo.stargazers_count}`}
                  initial={{ scale: 0.5, opacity: 0, y: 5 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="text-lg font-black tracking-tight"
                >
                  {repo.stargazers_count}
                </motion.span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col p-8 sm:p-10 relative z-10">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-coffee-950/5 dark:bg-white/10 rounded-xl">
                <GitBranch size={16} className="text-coffee-600 dark:text-coffee-300" />
              </div>
              <h3 className="font-serif italic font-black text-3xl text-coffee-950 dark:text-white truncate tracking-tight">
                {repo.name}
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
                {repo.language && (
                    <span className="px-3.5 py-1.5 liquid-glass-high text-[10px] font-black uppercase tracking-[0.2em] text-coffee-600 dark:text-coffee-300 rounded-full">
                        {repo.language}
                    </span>
                )}
                <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20">
                  {analysis.roast}
                </span>
            </div>
          </header>

          <p className="text-coffee-700 dark:text-coffee-400 mb-10 text-base leading-relaxed line-clamp-2 font-medium opacity-90">
              {repo.description || "An undocumented secret blend of pure logic and evening silence distilled into high-performance source code."}
          </p>

          {/* Topics */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {repo.topics.slice(0, 5).map(topic => (
                <button 
                  key={topic} 
                  onClick={() => onTopicClick?.(topic)}
                  className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border transition-all active:scale-95 ${
                    selectedTopic === topic
                    ? 'bg-coffee-950 text-white border-coffee-950 dark:bg-white dark:text-coffee-950 dark:border-white'
                    : 'bg-white/40 dark:bg-white/5 text-coffee-500 border-coffee-200/30 hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}

          {/* Stats Summary Panel */}
          <div className="grid grid-cols-2 gap-4 mb-10 mt-auto">
            <div className="bg-white/40 dark:bg-white/5 p-4 rounded-3xl border border-white/20 flex flex-col">
               <span className="text-[9px] font-black text-coffee-500 dark:text-coffee-400 uppercase tracking-widest mb-1">Impact</span>
               <div className="flex items-center gap-2">
                 <GitFork size={14} className="text-coffee-900 dark:text-white" />
                 <span className="font-black text-sm">{repo.forks_count} Forks</span>
               </div>
            </div>
            <div className="bg-white/40 dark:bg-white/5 p-4 rounded-3xl border border-white/20 flex flex-col">
               <span className="text-[9px] font-black text-coffee-500 dark:text-coffee-400 uppercase tracking-widest mb-1">Issues</span>
               <div className="flex items-center gap-2">
                 <CircleDot size={14} className="text-coffee-900 dark:text-white" />
                 <span className="font-black text-sm">{repo.open_issues_count} Active</span>
               </div>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4">
            <a 
              href={repo.html_url} 
              target="_blank" 
              className="flex-1 min-h-[50px] sm:min-h-[60px] bg-coffee-950 dark:bg-white text-white dark:text-coffee-950 rounded-3xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-95 transition-all shadow-xl"
            >
              Taste Code
              <ExternalLink size={16} />
            </a>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyCloneUrl}
              className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center rounded-3xl liquid-glass-high text-coffee-500 hover:text-coffee-950 dark:hover:text-white transition-all hover:shadow-lg relative overflow-hidden"
              title="Copy Git Clone Command"
            >
              <AnimatePresence mode='wait'>
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check size={20} className="text-emerald-500 sm:w-6 sm:h-6" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Copy size={20} className="sm:w-6 sm:h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowStats(true)}
              className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center rounded-3xl liquid-glass-high text-coffee-500 hover:text-coffee-950 dark:hover:text-white transition-all hover:shadow-lg"
              title="Roast Lab Analytics"
            >
              <BarChart2 size={24} className="sm:w-8 sm:h-8" />
            </motion.button>
          </div>

          <div className="mt-10 pt-8 border-t border-coffee-950/5 dark:border-white/5">
              <button 
                  onClick={toggleExpand}
                  className="w-full text-[10px] font-black tracking-[0.5em] text-coffee-400 hover:text-coffee-950 dark:hover:text-white transition-colors flex items-center justify-center gap-4 uppercase"
              >
                  {expanded ? 'Conceal Archive' : 'Detailed Narrative'}
                  <ChevronDown className={`transition-transform duration-700 ${expanded ? 'rotate-180' : ''}`} size={16} />
              </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="bg-white/40 dark:bg-black/40 overflow-hidden border-t border-coffee-200/50 dark:border-white/5"
            >
              <div className="p-10 sm:p-12 prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:text-coffee-800 dark:prose-p:text-coffee-300 prose-headings:font-serif italic">
                  {loadingReadme ? (
                    <div className="flex flex-col items-center py-20 gap-6 opacity-40">
                      <div className="relative">
                        <Loader2 size={32} className="animate-spin text-coffee-600" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.5em]">Decanting...</span>
                    </div>
                  ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} urlTransform={transformImageUri}>
                          {readme || ''}
                      </ReactMarkdown>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showStats && (
            <RepoStatsModal repo={repo} onClose={() => setShowStats(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default RepoCard;
