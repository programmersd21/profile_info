
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitHubUser } from '../types';
import { Users, ArrowUpRight, Search, Coffee, UserCheck } from 'lucide-react';

interface FollowersListProps {
  followers: GitHubUser[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25 }
  }
};

const FollowersList: React.FC<FollowersListProps> = ({ followers }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return followers.filter(f => 
      f.login.toLowerCase().includes(search.toLowerCase()) || 
      (f.name && f.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [followers, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      <header className="mb-16 md:mb-24 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-coffee-500 font-display text-xs font-black tracking-widest uppercase mb-4"
            >
              <UserCheck size={16} />
              <span>Patron Registry</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-serif font-black tracking-tighter"
            >
              The <span className="italic text-coffee-600 dark:text-coffee-400">Patrons</span>
            </motion.h2>
          </div>
          
          <div className="flex items-center gap-4 liquid-glass-high p-2 pr-6 rounded-full shadow-lg min-w-[320px] group focus-within:ring-2 ring-coffee-300 transition-all">
            <div className="bg-coffee-950/10 dark:bg-white/10 p-3 rounded-full"><Search className="text-coffee-600 dark:text-coffee-300" size={18} /></div>
            <input 
              type="text" 
              placeholder="Search registry..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full font-display text-xs font-black uppercase tracking-widest placeholder:text-coffee-400 dark:text-white"
            />
          </div>
        </div>
      </header>

      {filtered.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((patron) => (
              <motion.div
                key={patron.id}
                layout="position"
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="group relative liquid-glass p-8 rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-all"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/50 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img 
                      src={patron.avatar_url} 
                      className="w-20 h-20 rounded-full border-2 border-white/20 shadow-lg object-cover relative z-10" 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-coffee-950 dark:bg-white rounded-full p-2 z-20 shadow-md">
                      <Coffee size={10} className="text-white dark:text-coffee-950" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-display font-black text-coffee-400 uppercase tracking-widest mb-1">ID #{patron.id.toString().slice(-4)}</p>
                    <h4 className="text-xl font-serif font-black italic text-coffee-950 dark:text-white truncate">@{patron.login}</h4>
                  </div>
                </div>
                
                <p className="text-xs text-coffee-500 dark:text-coffee-400 leading-relaxed mb-8 min-h-[40px] italic">
                  One of {followers.length} regular patrons savoring the daily brew.
                </p>

                <div className="flex justify-end">
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={patron.html_url} target="_blank"
                    className="flex items-center gap-2 font-display text-[9px] font-black uppercase tracking-widest text-coffee-600 dark:text-coffee-300 border border-coffee-950/10 dark:border-white/10 px-5 py-2.5 rounded-2xl hover:bg-coffee-950 hover:text-white dark:hover:bg-white dark:hover:text-coffee-950 transition-colors"
                  >
                    Investigate
                    <ArrowUpRight size={14} />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40">
          <Coffee size={48} className="mx-auto text-coffee-200 mb-6 animate-bounce" />
          <h3 className="text-xl font-display font-black text-coffee-300 uppercase tracking-widest">Patron Not Found</h3>
          <p className="text-sm text-coffee-400 font-serif italic mt-2">The registry contains no records matching this query.</p>
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(FollowersList);
