import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Thermometer, Clock, Zap, Shield, RotateCcw, Heart, Sparkles, Filter, CupSoda } from 'lucide-react';

interface CustomBrew {
  id: string;
  name: string;
  blend: string;
  grind: string;
  temp: number;
  preInfusion: boolean;
  score: number;
  notes: string;
  color: string;
  timestamp: string;
}

const BEANS = [
  { id: 'ts', name: 'Single Origin TypeScript', desc: 'Bright, highly typed, crisp syntax with notes of strong contracts and asynchronous jasmine.', color: '#a67c52', hoverColor: 'from-blue-500 to-amber-600' },
  { id: 'rust', name: 'Dark Roast Rust', desc: 'Heavy-bodied, robust, memory-safe roast with deep metallic notes of compiler borrow-checking.', color: '#8c5e3c', hoverColor: 'from-orange-700 to-coffee-800' },
  { id: 'py', name: 'Organic Python Zen', desc: 'Smooth, easily drinkable, clean syntax with earthy undertones of machine learning and quick prototyping.', color: '#593a27', hoverColor: 'from-emerald-600 to-yellow-600' },
  { id: 'cpp', name: 'Espresso C++', desc: 'Extremely fast, highly pressurized, complex extraction with bitter-sharp notes of raw pointers.', color: '#332116', hoverColor: 'from-purple-700 to-red-700' },
];

const GRINDS = [
  { id: 'fine', name: 'Fine (Espresso)', desc: 'Maximizes body and compiler density.', factor: 1.2 },
  { id: 'medium', name: 'Medium (Drip)', desc: 'Balanced extraction and runtime complexity.', factor: 1.0 },
  { id: 'coarse', name: 'Coarse (Cold Brew)', desc: 'Lightweight, ultra-asynchronous profile.', factor: 0.8 },
];

const CoffeeBrewlab: React.FC = () => {
  const [selectedBean, setSelectedBean] = useState(BEANS[0]);
  const [selectedGrind, setSelectedGrind] = useState(GRINDS[0]);
  const [temperature, setTemperature] = useState(92);
  const [preInfusion, setPreInfusion] = useState(true);
  const [isBrewing, setIsBrewing] = useState(false);
  const [brewProgress, setBrewProgress] = useState(0);
  const [activeStage, setActiveStage] = useState<'idle' | 'infusing' | 'extracting' | 'completed'>('idle');
  const [flavorRating, setFlavorRating] = useState<string>('');
  const [intensityScore, setIntensityScore] = useState(0);
  const [favorites, setFavorites] = useState<CustomBrew[]>([]);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  // Load saved brews
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sh_brews_v1');
      if (saved) setFavorites(JSON.parse(saved));
    } catch (e) {
      console.warn('Could not read saved brews', e);
    }
  }, []);

  // Simulator Extraction Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isBrewing) {
      setBrewProgress(0);
      setActiveStage('infusing');
      
      const duration = 4000; // 4 seconds total
      const step = 50;
      const increment = (step / duration) * 100;
      
      interval = setInterval(() => {
        setBrewProgress((prev) => {
          const next = prev + increment;
          if (next >= 100) {
            clearInterval(interval);
            setIsBrewing(false);
            setActiveStage('completed');
            generateBrewResult();
            return 100;
          }
          
          if (next >= 30 && activeStage === 'infusing') {
            setActiveStage('extracting');
          }
          
          return next;
        });
      }, step);
    }
    return () => clearInterval(interval);
  }, [isBrewing]);

  const generateBrewResult = () => {
    // Generate organic calculation based on selections
    const heatImpact = Math.abs(temperature - 92) * 0.5;
    const grindFactor = selectedGrind.factor;
    const preInfuseBonus = preInfusion ? 1.1 : 0.9;
    
    // Quality scoring
    const finalScore = Math.max(
      60,
      Math.min(100, Math.round((100 - heatImpact) * grindFactor * preInfuseBonus))
    );
    
    // Descriptive generation
    let notes = '';
    if (finalScore > 92) {
      notes = 'A perfect extraction! Utterly flawless compile without a single runtime exception. Clean, sparkling clarity.';
    } else if (finalScore > 80) {
      notes = 'An exceptional cup. Highly performant with a robust body, though carries a trace of compiler warming.';
    } else if (finalScore > 70) {
      notes = 'Decent daily driver. Extraction lacks fine-grain optimization, resulting in a slightly bitter garbage collection.';
    } else {
      notes = 'Slightly over-extracted or under-pressurized. A bit sluggish on load, watch out for memory leaks.';
    }

    setFlavorRating(notes);
    setIntensityScore(finalScore);
  };

  const saveBrewToFavorites = () => {
    const newBrew: CustomBrew = {
      id: Math.random().toString(36).substring(2, 9),
      name: `${selectedBean.name.split(' ').slice(-1)[0]} Signature`,
      blend: selectedBean.name,
      grind: selectedGrind.name,
      temp: temperature,
      preInfusion: preInfusion,
      score: intensityScore,
      notes: flavorRating,
      color: selectedBean.color,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextFavorites = [newBrew, ...favorites].slice(0, 5);
    setFavorites(nextFavorites);
    try {
      localStorage.setItem('sh_brews_v1', JSON.stringify(nextFavorites));
    } catch (e) {
      console.warn('Storage limit hit', e);
    }

    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2000);
  };

  const removeFavorite = (id: string) => {
    const nextFavorites = favorites.filter((f) => f.id !== id);
    setFavorites(nextFavorites);
    try {
      localStorage.setItem('sh_brews_v1', JSON.stringify(nextFavorites));
    } catch (e) {
      console.warn(e);
    }
  };

  const resetAll = () => {
    setActiveStage('idle');
    setBrewProgress(0);
    setIntensityScore(0);
    setFlavorRating('');
  };

  return (
    <div className="w-full relative">
      <AnimatePresence>
        {showSavedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[450] bg-coffee-950 dark:bg-white text-white dark:text-coffee-950 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 border border-white/10"
          >
            <Sparkles size={14} className="text-amber-500 animate-spin" />
            Cup Saved to Cellar Favorites
          </motion.div>
        )}
      </AnimatePresence>

      <section className="py-24 liquid-glass border-t-0 rounded-[3rem] md:rounded-[5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] relative z-10 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 liquid-glass-high text-coffee-700 dark:text-coffee-300 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              <span>Interactive Space</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-coffee-950 dark:text-coffee-50 tracking-tight leading-none">
              The Brew <span className="font-serif italic text-coffee-600 dark:text-coffee-400">Lab</span>
            </h2>
            <p className="text-coffee-600 dark:text-coffee-400 text-sm sm:text-base font-serif italic max-w-xl mx-auto">
              Simulate and extract high-performance digital blends. Tinker with parameters to roast custom compilation metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* PARAMETERS CONTROL CABINET */}
            <div className="lg:col-span-7 flex flex-col space-y-8">
              <div className="p-8 sm:p-10 liquid-glass rounded-[2rem] sm:rounded-[3rem] shadow-xl space-y-8 flex-1">
                
                {/* 1. SELECTION OF BEANS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-coffee-600 dark:text-coffee-300">
                      1. Select Base Bean (Software Stack)
                    </span>
                    <span className="font-sans font-black text-xs text-coffee-400 capitalize bg-coffee-100 dark:bg-white/5 px-3 py-1 rounded-full">
                      {selectedBean.id.toUpperCase()} Origin
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {BEANS.map((bean) => (
                      <button
                        key={bean.id}
                        onClick={() => !isBrewing && setSelectedBean(bean)}
                        disabled={isBrewing}
                        className={`text-left p-5 rounded-[1.5rem] border transition-all relative overflow-hidden flex flex-col justify-between ${
                          isBrewing ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          selectedBean.id === bean.id
                            ? 'bg-coffee-950 dark:bg-white text-white dark:text-coffee-950 border-coffee-950 dark:border-white shadow-lg scale-[1.02]'
                            : 'bg-white/30 dark:bg-white/5 text-coffee-800 dark:text-coffee-200 border-coffee-200/50 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <p className="font-serif italic font-black text-lg mb-1">{bean.name}</p>
                          <p className={`text-[11px] leading-relaxed line-clamp-2 ${selectedBean.id === bean.id ? 'opacity-80' : 'opacity-60'}`}>
                            {bean.desc}
                          </p>
                        </div>
                        {selectedBean.id === bean.id && (
                          <div className={`absolute bottom-0 right-0 w-24 h-2 bg-gradient-to-r ${bean.hoverColor} filter blur-xs animate-pulse`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. GRIND LEVEL */}
                <div className="space-y-4">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-coffee-600 dark:text-coffee-300">
                    2. Choose Grind Granularity
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {GRINDS.map((grind) => (
                      <button
                        key={grind.id}
                        disabled={isBrewing}
                        onClick={() => setSelectedGrind(grind)}
                        className={`p-4 rounded-2xl text-center border text-[10px] font-black uppercase tracking-widest transition-all ${
                          isBrewing ? 'opacity-50' : ''
                        } ${
                          selectedGrind.id === grind.id
                            ? 'bg-coffee-950 dark:bg-white text-white dark:text-coffee-950 border-coffee-950 dark:border-white shadow-md'
                            : 'bg-white/20 dark:bg-white/5 border-coffee-200/30 dark:border-white/5 hover:bg-white/40 dark:hover:bg-white/10'
                        }`}
                      >
                        {grind.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] font-sans text-coffee-500 italic text-center">
                    "{selectedGrind.desc}"
                  </p>
                </div>

                {/* 3. TEMPERATURE & PREINFUSION SPLIT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-4 p-5 liquid-glass-high rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-coffee-600 dark:text-coffee-300 flex items-center gap-1">
                        <Thermometer size={14} /> Extraction Temp
                      </span>
                      <span className="font-mono font-black text-xs text-amber-600">{temperature}°C</span>
                    </div>
                    <input
                      type="range"
                      min="75"
                      max="102"
                      disabled={isBrewing}
                      value={temperature}
                      onChange={(e) => setTemperature(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-coffee-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-coffee-600 dark:accent-white disabled:opacity-50"
                    />
                    <div className="flex justify-between text-[9px] text-coffee-400 font-bold uppercase tracking-widest">
                      <span>75° Cold brew</span>
                      <span>100° Boil</span>
                    </div>
                  </div>

                  <div className="space-y-4 p-5 liquid-glass-high rounded-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-coffee-600 dark:text-coffee-300 flex items-center gap-1">
                        <Clock size={14} /> Pre-Infusion Mode
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${preInfusion ? 'bg-emerald-500/10 text-emerald-600' : 'bg-coffee-200 text-coffee-600'}`}>
                        {preInfusion ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group mt-2">
                      <input
                        type="checkbox"
                        checked={preInfusion}
                        disabled={isBrewing}
                        onChange={(e) => setPreInfusion(e.target.checked)}
                        className="hidden"
                      />
                      <div className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${isBrewing ? 'opacity-40' : ''} ${preInfusion ? 'bg-gradient-to-r from-coffee-600 to-amber-500' : 'bg-coffee-300'}`}>
                        <div className={`h-5 w-5 rounded-full bg-white transition-transform duration-300 ${preInfusion ? 'transform translate-x-6' : ''}`} />
                      </div>
                      <span className="text-xs font-bold text-coffee-600 dark:text-coffee-200 group-hover:text-coffee-950 dark:group-hover:text-white transition-colors">
                        Moisten puck first
                      </span>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* LIVE BREWING SEQUENCE SCREEN */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="p-8 sm:p-10 bg-coffee-950 text-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col justify-between relative overflow-hidden flex-grow group">
                <div className="absolute inset-0 bg-gradient-to-br from-coffee-900 via-coffee-950 to-black z-0" />
                
                {/* Embedded Steam/Beans Animations background */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none z-0">
                  <Coffee size={256} className="text-white animate-pulse" />
                </div>
                
                <div className="relative z-10 flex flex-col h-full space-y-8 justify-between">
                  <header className="flex justify-between items-center">
                    <div>
                      <h4 className="font-serif italic text-white text-xl">Shot Telemetry</h4>
                      <p className="text-[9px] font-black uppercase tracking-widest text-coffee-500">Compiling Extraction</p>
                    </div>
                    <CupSoda size={24} className={isBrewing ? 'animate-bounce text-amber-500' : 'text-coffee-400'} />
                  </header>

                  {/* VISUAL SHOT GLASS IN EXTENSION ACTION */}
                  <div className="relative h-44 w-full flex items-center justify-center bg-black/40 border border-white/5 rounded-2xl shadow-inner">
                    {activeStage === 'idle' && (
                      <div className="text-center space-y-2 opacity-60">
                        <Coffee size={36} className="mx-auto text-coffee-400 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-coffee-300">Portafilter Loaded</p>
                      </div>
                    )}

                    {/* Brewing Progress indicators */}
                    {(activeStage === 'infusing' || activeStage === 'extracting') && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4">
                        
                        {/* Interactive Steam Drops using framer-motion */}
                        <div className="absolute top-2 w-full flex justify-center space-x-4">
                          {[1, 2, 3].map((drop) => (
                            <motion.div
                              key={drop}
                              animate={{ y: [0, 100], opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
                              transition={{ repeat: Infinity, duration: 1.2, delay: drop * 0.3 }}
                              className={`w-1 rounded-full h-8 ${activeStage === 'extracting' ? 'bg-amber-600' : 'bg-amber-800'}`}
                            />
                          ))}
                        </div>

                        <div className="text-center z-10 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 animate-pulse">
                            {activeStage === 'infusing' ? 'Pre-heating Puck...' : 'PULLING LIQUID ESPRESSO'}
                          </p>
                          <p className="text-2xl font-mono font-black">{Math.round(brewProgress)}%</p>
                        </div>
                      </div>
                    )}

                    {activeStage === 'completed' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-3 p-6"
                      >
                        <div className="relative inline-block">
                          <Coffee size={32} className="text-amber-500 mx-auto" />
                          <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Pour Decanted</p>
                          <p className="text-3xl font-black font-serif italic text-white mt-1">{intensityScore}/100</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Filling Espresso Cup animation */}
                    {isBrewing && (
                      <div className="absolute bottom-0 left-0 right-0 bg-coffee-800/20 overflow-hidden h-12 border-t border-white/5 rounded-b-2xl">
                        <motion.div
                          animate={{ y: ['100%', '0%'] }}
                          transition={{ duration: 4, ease: 'easeOut' }}
                          className="h-full w-full"
                          style={{ backgroundColor: selectedBean.color, opacity: 0.8 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* RESULTS DESCRIPTION AND ACTIONS */}
                  <AnimatePresence mode="wait">
                    {activeStage === 'completed' && flavorRating && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4"
                      >
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-coffee-400 mb-1">Tasting Metrics</p>
                          <p className="text-xs leading-relaxed font-serif italic font-medium text-coffee-100">
                            "{flavorRating}"
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={saveBrewToFavorites}
                            className="flex-1 py-3.5 bg-white text-coffee-950 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-coffee-100 transition-all flex items-center justify-center gap-2"
                          >
                            <Heart size={12} className="fill-coffee-950" /> Add to Vault
                          </button>
                          <button
                            onClick={resetAll}
                            className="px-4 py-3.5 border border-white/10 rounded-xl text-coffee-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
                            title="Reset Brew Screen"
                          >
                            <RotateCcw size={12} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* START PULL TRIGGER BUTTON */}
                  <button
                    disabled={isBrewing}
                    onClick={() => setIsBrewing(true)}
                    className={`w-full h-16 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all relative overflow-hidden ${
                      isBrewing
                        ? 'bg-coffee-900 text-coffee-500 cursor-not-allowed border border-white/5'
                        : 'bg-gradient-to-r from-coffee-600 to-amber-500 text-white hover:scale-[1.02] shadow-[0_15px_30px_rgba(217,119,6,0.2)] hover:shadow-[0_15px_40px_rgba(217,119,6,0.35)] active:scale-95'
                    }`}
                  >
                    {isBrewing ? (
                      <span className="flex items-center gap-3">
                        <Loader2 className="animate-spin text-amber-500" size={16} /> EXTRACTING BLEND...
                      </span>
                    ) : (
                      <span className="flex items-center gap-4">
                        PULL SHOT <Coffee size={16} strokeWidth={2} />
                      </span>
                    )}
                  </button>

                </div>
              </div>
            </div>

          </div>

          {/* FAVORITE BREWED ARCHIVES CONTAINER */}
          {favorites.length > 0 && (
            <div className="mt-16 space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-coffee-400 whitespace-nowrap">
                  My Brew Cellar Records
                </span>
                <div className="h-px flex-1 bg-coffee-200 dark:bg-white/10" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {favorites.map((brew) => (
                  <motion.div
                    key={brew.id}
                    layout
                    className="p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-coffee-200/50 dark:border-white/5 flex flex-col justify-between h-48 relative shadow-sm group hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: brew.color }}
                        />
                        <button
                          onClick={() => removeFavorite(brew.id)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-coffee-400 hover:text-red-500 transition-all font-black"
                        >
                          DUMP
                        </button>
                      </div>
                      <p className="font-serif italic font-black text-base text-coffee-950 dark:text-white truncate">
                        {brew.name}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-coffee-400 truncate mt-1">
                        {brew.blend}
                      </p>
                      <p className="text-[9px] text-coffee-500 dark:text-coffee-300 line-clamp-2 italic font-mono leading-relaxed mt-2">
                        {brew.notes}
                      </p>
                    </div>
                    <div className="flex justify-between items-end border-t border-coffee-950/5 dark:border-white/5 pt-2 mt-2">
                      <span className="text-[10px] font-mono font-black text-amber-500">
                        {brew.score}/100
                      </span>
                      <span className="text-[8px] font-black tracking-widest text-coffee-400 font-sans">
                        {brew.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default React.memo(CoffeeBrewlab);
