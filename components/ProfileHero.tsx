
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ChevronDown, Coffee, ArrowDownRight } from 'lucide-react';
import { GitHubUser } from '../types';
import { fetchReadme } from '../services/githubService';

interface ProfileHeroProps {
  user: GitHubUser;
  setView: (view: 'home' | 'followers' | 'stats') => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1, 
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(5px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 200, damping: 20 } 
  }
};

const ProfileHero: React.FC<ProfileHeroProps> = ({ user, setView }) => {
  const [readme, setReadme] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchReadme(user.login, 'main').then(res => res && setReadme(res.content));
  }, [user.login]);

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative pt-32 lg:pt-48 pb-20 overflow-visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-16 lg:gap-24">
          {/* Visual Identity */}
          <motion.div 
            variants={itemVariants}
            className="flex-shrink-0 text-center lg:text-left space-y-10"
          >
            <div className="relative group">
              {/* Glass container for avatar */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full p-2 liquid-glass-high shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
                <img src={user.avatar_url} className="w-full h-full rounded-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="absolute -bottom-4 -right-4 liquid-glass-high text-coffee-950 dark:text-white p-5 rounded-full shadow-2xl rotate-12 transition-transform"
              >
                <Coffee size={32} />
              </motion.div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter text-coffee-950 dark:text-white italic">
                {user.name || user.login}
              </h1>
              <p className="text-xl font-mono text-coffee-600 dark:text-coffee-300 tracking-tight">@{user.login}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('stats')} 
                className="bg-coffee-950 dark:bg-white text-white dark:text-coffee-950 p-6 rounded-[2rem] text-center shadow-2xl transition-all group"
              >
                <span className="block text-3xl font-black mb-1">{user.public_repos}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-coffee-400 group-hover:text-coffee-500 transition-colors">Vintages</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('followers')} 
                className="liquid-glass p-6 rounded-[2rem] text-center shadow-lg transition-all group"
              >
                <span className="block text-3xl font-black mb-1">{user.followers}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-coffee-500 dark:text-coffee-400 group-hover:text-coffee-700 transition-colors">Patrons</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Narrative Content */}
          <motion.div 
            variants={itemVariants}
            className="flex-1 liquid-glass rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-3xl"
          >
            <div className="p-10 md:p-16">
              <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-coffee-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-coffee-500 dark:text-coffee-400">Master Roaster's Manifesto</span>
                </div>
                <ArrowDownRight className="text-coffee-400" size={24} />
              </header>

              <div className="relative">
                <motion.div 
                  animate={{ height: isExpanded ? 'auto' : 320 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className={`prose prose-sm md:prose-lg dark:prose-invert max-w-none prose-headings:font-serif italic prose-p:text-coffee-900/90 dark:prose-p:text-coffee-100/90 overflow-hidden ${!isExpanded ? 'mask-gradient-bottom' : ''}`}
                >
                  {readme ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {readme}
                    </ReactMarkdown>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center opacity-40">
                      <Coffee className="animate-spin mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Decanting Manifesto...</p>
                    </div>
                  )}
                </motion.div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.6)" }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-12 w-full py-6 liquid-glass-high transition-colors rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] text-coffee-500 dark:text-coffee-300 flex items-center justify-center gap-3 shadow-lg"
              >
                {isExpanded ? 'Conceal Archive' : 'Extract Full Narrative'}
                <ChevronDown className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default ProfileHero;
