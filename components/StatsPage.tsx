
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { CoffeeStats } from '../types';
import { Star, GitFork, BarChart3, Coffee, Clock, Activity, Filter } from 'lucide-react';

interface StatsPageProps {
  stats: CoffeeStats;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 150, damping: 20 }
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="liquid-glass-high p-4 rounded-2xl shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-coffee-500 mb-1 font-sans">{label}</p>
        <p className="text-xl font-black text-coffee-900 dark:text-white font-sans flex items-center gap-2">
          {payload[0].value} <span className="text-xs text-coffee-400 font-medium">Accumulated Units</span>
        </p>
      </div>
    );
  }
  return null;
};

const StatsPage: React.FC<StatsPageProps> = ({ stats }) => {
  const trendData = useMemo(() => {
    // Generate some smooth growth data based on total stars
    return [
      { name: 'Jan', value: Math.floor(stats.totalStars * 0.45) },
      { name: 'Feb', value: Math.floor(stats.totalStars * 0.58) },
      { name: 'Mar', value: Math.floor(stats.totalStars * 0.52) },
      { name: 'Apr', value: Math.floor(stats.totalStars * 0.78) },
      { name: 'May', value: Math.floor(stats.totalStars * 0.88) },
      { name: 'Jun', value: stats.totalStars },
    ];
  }, [stats.totalStars]);

  const langData = useMemo(() => {
    return stats.topLanguages.map((l, i) => ({
      name: l.lang,
      value: l.count,
      color: i === 0 ? '#8c5e3c' : i === 1 ? '#a67c52' : i === 2 ? '#c6a68f' : '#d9c5b2'
    }));
  }, [stats.topLanguages]);

  const statCards = [
    { label: 'Extraction Strength', value: stats.brewStrength, icon: Activity, trend: '+14.2%', color: 'text-coffee-600' },
    { label: 'Global Stars', value: stats.totalStars, icon: Star, trend: '+8.4%', color: 'text-amber-500' },
    { label: 'Fork Density', value: stats.totalForks, icon: GitFork, trend: '+3.9%', color: 'text-coffee-500' },
    { label: 'Cellar Maturity', value: `${stats.accountAgeDays}d`, icon: Clock, trend: 'VINTAGE', color: 'text-coffee-700' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-36 space-y-20"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6">
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3 text-coffee-500 font-mono text-[11px] tracking-[0.4em] uppercase"
          >
            <div className="w-10 h-[1px] bg-coffee-300" />
            <span>Telemetry v2.05</span>
          </motion.div>
          <motion.h2 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-serif font-black tracking-tighter leading-[0.9]"
          >
            The Daily <span className="italic text-coffee-600 dark:text-coffee-400">Yield</span>
          </motion.h2>
        </div>
        <motion.div 
          variants={itemVariants}
          className="liquid-glass p-2 pr-8 rounded-full flex items-center gap-5 shadow-lg"
        >
          <div className="bg-coffee-950 dark:bg-white p-4 rounded-full text-white dark:text-coffee-950 shadow-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-coffee-400 mb-1">Processing Node</p>
            <p className="text-sm font-black text-emerald-500 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live & Calibrated
            </p>
          </div>
        </motion.div>
      </header>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="liquid-glass p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group cursor-default"
          >
            <div className="relative z-10 flex justify-between items-start mb-12">
              <div className={`p-5 rounded-3xl bg-white/50 dark:bg-coffee-800/50 shadow-inner group-hover:scale-110 transition-transform duration-700 ${card.color}`}>
                <card.icon size={28} />
              </div>
              <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest">
                {card.trend}
              </div>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-coffee-400 mb-2 font-sans">{card.label}</p>
            <h3 className="text-5xl font-black tracking-tighter text-coffee-950 dark:text-white font-sans">
              {card.value}
            </h3>
            {/* Visual Flare */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/20 dark:bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 liquid-glass p-12 rounded-[3.5rem] shadow-xl flex flex-col min-h-[550px]"
        >
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight text-coffee-950 dark:text-white">Roast Velocity</h3>
              <p className="text-[11px] text-coffee-400 uppercase tracking-widest font-black flex items-center gap-2">
                <Activity size={12} />
                Volume Analytics • Current Cycle
              </p>
            </div>
            <div className="flex gap-2">
               <button className="p-4 bg-white/50 dark:bg-white/10 rounded-2xl hover:bg-white transition-colors shadow-sm"><Filter size={16} /></button>
            </div>
          </div>
          
          <div className="flex-1 w-full -ml-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a67c52" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a67c52" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(140, 94, 60, 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a67c52', fontSize: 11, fontWeight: 900 }} dy={20} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8c5e3c', strokeWidth: 2, strokeDasharray: '8 8' }} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8c5e3c" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-coffee-950 p-12 rounded-[3.5rem] shadow-2xl flex flex-col group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-coffee-900 to-black z-0" />
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-3xl font-black tracking-tight text-white mb-2 italic font-serif">Flavor Profile</h3>
            <p className="text-[10px] text-coffee-500 uppercase tracking-[0.4em] font-black mb-16">Language Distribution Analytics</p>
            
            <div className="space-y-10 flex-1">
              {langData.map((lang, idx) => (
                <div key={lang.name} className="relative">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-coffee-100 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lang.color }} />
                      {lang.name}
                    </span>
                    <span className="text-[10px] font-mono text-coffee-600 font-bold">{lang.value} Units</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(lang.value / langData[0].value) * 100}%` }}
                      transition={{ duration: 2, ease: "circOut", delay: idx * 0.1 }}
                      style={{ backgroundColor: lang.color }}
                      className="h-full rounded-full shadow-[0_0_20px_rgba(140,94,60,0.3)]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 pt-10 border-t border-white/10 flex items-center justify-between">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-coffee-950 bg-coffee-900 flex items-center justify-center text-[10px] font-black group-hover:translate-x-1 transition-transform cursor-pointer">
                    <Coffee size={14} className="text-coffee-600" />
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-white italic font-serif">Signature Selection</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-coffee-600">Top Roast Tiers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsPage;
