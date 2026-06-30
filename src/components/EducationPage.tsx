import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wind, Heart, Leaf, Activity, ChevronDown, Globe2, ArrowRight, ShieldCheck } from 'lucide-react';

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-teal-500/20 rounded-full"
          initial={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100],
            x: [0, Math.random() * 50 - 25],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

const GreenScreenSlider = () => {
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <div className="relative w-full h-48 bg-slate-100 rounded-2xl overflow-hidden my-6 shadow-inner">
      {/* Background: Without Green Screen (Polluted) */}
      <div className="absolute inset-0 bg-slate-200 flex items-center justify-end pr-4">
        <div className="absolute inset-0 opacity-40">
           {[...Array(40)].map((_, i) => (
             <motion.div 
               key={i} 
               className="absolute w-1 h-1 bg-slate-600 rounded-full" 
               style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }} 
               animate={{ x: [0, 20], opacity: [0.2, 0.8, 0.2] }}
               transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
             />
           ))}
        </div>
        <span className="text-[10px] font-bold text-slate-500 z-10 bg-white/80 px-2 py-1 rounded uppercase tracking-wider">Without Barrier</span>
      </div>

      {/* Foreground: With Green Screen (Clean) */}
      <div 
        className="absolute inset-y-0 left-0 bg-teal-50 overflow-hidden border-r-2 border-white flex items-center justify-start pl-4"
        style={{ width: `${sliderValue}%` }}
      >
        <div className="absolute right-0 inset-y-0 w-12 bg-forest-600/90 backdrop-blur-sm flex flex-col justify-around items-center py-2">
           <Leaf className="w-4 h-4 text-forest-300 opacity-50" />
           <Leaf className="w-4 h-4 text-forest-300 opacity-50" />
           <Leaf className="w-4 h-4 text-forest-300 opacity-50" />
        </div>
        <span className="text-[10px] font-bold text-teal-700 z-10 bg-white/80 px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap">With Green Screen</span>
      </div>

      {/* Slider Control */}
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={sliderValue} 
        onChange={(e) => setSliderValue(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
      />
      
      {/* Slider Handle */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none z-10"
        style={{ left: `calc(${sliderValue}% - 16px)` }}
      >
        <div className="w-1 h-4 bg-slate-300 rounded-full" />
        <div className="w-1 h-4 bg-slate-300 rounded-full ml-1" />
      </div>
    </div>
  );
};

export function EducationPage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Vertical Rail for Desktop */}
      <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-50 space-y-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex flex-col items-center gap-4 group cursor-pointer" onClick={() => document.getElementById('what-is-pm25')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase group-hover:text-rose-500 transition-colors">01 Problem</span>
          <div className="w-px h-12 bg-slate-200 group-hover:bg-rose-200 transition-colors" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="flex flex-col items-center gap-4 group cursor-pointer" onClick={() => document.getElementById('green-screen-solution')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase group-hover:text-teal-500 transition-colors">02 Solution</span>
          <div className="w-px h-12 bg-slate-200 group-hover:bg-teal-200 transition-colors" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="flex flex-col items-center gap-4 group cursor-pointer" onClick={() => document.getElementById('global-research')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase group-hover:text-sky-500 transition-colors">03 Research</span>
          <div className="w-px h-12 bg-slate-200 group-hover:bg-sky-200 transition-colors" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="flex flex-col items-center gap-4 group cursor-pointer" onClick={() => onNavigate('form')}>
          <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase group-hover:text-forest-600 transition-colors">04 Contribute</span>
        </motion.div>
      </div>

      {/* 1. Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-teal-50 to-slate-50 overflow-hidden">
        <ParticleBackground />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
            <Leaf className="w-8 h-8 text-teal-500" />
          </div>
          <h1 className="text-4xl font-display font-bold text-forest-900 mb-4 leading-tight">
            The Science of Clean Air
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-sm">
            Understanding PM2.5, Green Screens, and how nature protects our health.
          </p>
          <motion.button 
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white text-forest-700 px-6 py-3 rounded-full shadow-md font-medium flex items-center gap-2 hover:shadow-lg transition-all"
            onClick={() => {
              document.getElementById('what-is-pm25')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn How It Works <ChevronDown className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </section>

      {/* 2. What Is PM2.5? */}
      <section id="what-is-pm25" className="p-6 space-y-8 max-w-2xl mx-auto relative">
        {/* Vertical Connector Line */}
        <div className="absolute left-1/2 -top-12 w-px h-12 bg-gradient-to-b from-transparent to-rose-200 hidden md:block" />
        
        <motion.div 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">The Invisible Threat</div>
          <h2 className="text-4xl font-display font-bold text-forest-900 mb-2">What is PM2.5?</h2>
          <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">PM2.5 stands for <span className="text-forest-700 font-semibold underline decoration-rose-200 underline-offset-4">Particulate Matter</span> smaller than 2.5 micrometers.</p>
        </motion.div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Wind className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Where does it come from?</h4>
              <p className="text-xs text-slate-500 mt-1">Vehicle exhaust, brake & tire wear, construction dust, and industrial emissions.</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Why is it dangerous?</h4>
              <p className="text-xs text-slate-500 mt-1">Because they are so small, these particles can bypass your nose and throat, entering your lungs and even your bloodstream.</p>
            </div>
          </div>
        </div>

        {/* Visual Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">Size Comparison</h3>
          <div className="flex flex-col gap-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-100 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-amber-600 uppercase">Sand</span>
              </div>
              <p className="text-sm text-slate-600">A grain of sand is about 90 micrometers.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 border-4 border-slate-200 flex-shrink-0 flex items-center justify-center ml-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Hair</span>
              </div>
              <p className="text-sm text-slate-600">Human hair is 50-70 micrometers thick.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 ml-9 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
              <p className="text-sm text-slate-600"><strong className="text-red-600">PM2.5</strong> is so small it slips past your body's natural defenses.</p>
            </div>
          </div>
        </motion.div>

        {/* Why It Matters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-6 border border-rose-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-800">Why It Matters to You</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
              <p>Can enter your <strong>lungs and bloodstream</strong></p>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
              <p>Impacts <strong>heart health</strong> and triggers asthma</p>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
              <p>Especially harmful near <strong>busy roads</strong></p>
            </li>
          </ul>
        </motion.div>
      </section>

      {/* 3. How Green Screens Work */}
      <section id="green-screen-solution" className="p-6 bg-white space-y-6 rounded-3xl shadow-sm mx-2 mb-6 max-w-2xl md:mx-auto relative">
        {/* Vertical Connector Line */}
        <div className="absolute left-1/2 -top-12 w-px h-12 bg-gradient-to-b from-transparent to-teal-200 hidden md:block" />

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
          <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">The Solution</div>
          <h2 className="text-4xl font-display font-bold text-forest-900 mb-2">What is a Green Screen?</h2>
          <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">A "Green Screen" is a vertical vegetation barrier designed to act as a living air filter.</p>
        </motion.div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <p className="text-sm text-slate-700 leading-relaxed">
              In urban design, a green screen is typically a <span className="font-semibold text-forest-700">metal mesh or trellis covered in dense climbing plants</span> (like Ivy). Unlike solid walls, they allow some air to pass through while trapping pollutants on leaf surfaces.
            </p>
          </div>

        </div>

        <GreenScreenSlider />

        <div className="grid grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-teal-50 p-4 rounded-2xl">
            <Leaf className="w-6 h-6 text-teal-600 mb-2" />
            <h4 className="font-bold text-slate-800 text-sm mb-1">Leaves Trap</h4>
            <p className="text-xs text-slate-600">Rough leaf surfaces capture tiny particles.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-sky-50 p-4 rounded-2xl">
            <Wind className="w-6 h-6 text-sky-600 mb-2" />
            <h4 className="font-bold text-slate-800 text-sm mb-1">Slows Air</h4>
            <p className="text-xs text-slate-600">Dense plants force particles to settle down.</p>
          </motion.div>
        </div>
        
        <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100">
          <p className="text-sm text-forest-800 italic text-center font-medium">
            "A green screen works like a living air filter between traffic and people."
          </p>
        </div>

        {/* Types of Barriers */}
        <div className="pt-4 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest-600" />
            Types of Barriers
          </h3>
          
          <div className="space-y-4">
            {/* 1. Hedge */}
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center">
              <img 
                src="https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=500&auto=format&fit=crop&q=60" 
                alt="Lush green hedge barrier" 
                className="w-full sm:w-32 h-24 object-cover rounded-xl shadow-sm border border-slate-100"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-slate-800">Green Hedges & Ivy Screens</span>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Most Common</span>
                </div>
                <p className="text-xs text-slate-500">Dense evergreen hedges and ivy screens pre-grown on wire mesh. Highly space-efficient, easy to maintain, and extremely effective at trapping fine road particulate matter (PM2.5).</p>
              </div>
            </div>
            
            {/* 2. Tree Row */}
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center">
              <img 
                src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=500&auto=format&fit=crop&q=60" 
                alt="Row of trees flanking a path" 
                className="w-full sm:w-32 h-24 object-cover rounded-xl shadow-sm border border-slate-100"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-slate-800">Tree Rows</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">High Canopy</span>
                </div>
                <p className="text-xs text-slate-500">Linear arrangements of medium-to-tall trees. Excellent for wide roads and avenues, providing shade, cooling, and intercepting airborne dust across a broader vertical profile.</p>
              </div>
            </div>

            {/* 3. Living Wall */}
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center">
              <img 
                src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=500&auto=format&fit=crop&q=60" 
                alt="Tropical living wall vertical garden" 
                className="w-full sm:w-32 h-24 object-cover rounded-xl shadow-sm border border-slate-100"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-slate-800">Living Walls (Green Walls)</span>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">High Tech</span>
                </div>
                <p className="text-xs text-slate-500">Complex modular systems with integrated irrigation, mounted directly on building walls or standalone frames. Supports dense, varied plant varieties like ferns, mosses, and broadleaf species.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why We Study Green Screens Globally */}
      <section id="global-research" className="p-6 space-y-6 bg-slate-900 text-white rounded-t-[2.5rem] mt-8 pt-10 relative overflow-hidden">
        {/* Vertical Rail Text inside Dark Section */}
        <div className="absolute right-6 top-20 hidden md:block">
          <span className="[writing-mode:vertical-rl] text-[10px] font-bold tracking-[0.3em] text-slate-700 uppercase">Global Research Network</span>
        </div>

        <div className="text-center relative z-10">
          <Globe2 className="w-10 h-10 text-glow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Global Research</h2>
          <p className="text-slate-400 text-sm">Data helps design better urban spaces.</p>
        </div>

        <div className="relative h-48 bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 flex items-center justify-center shadow-inner">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-glow-500/20 via-transparent to-transparent"></div>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-glow-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{ opacity: [0.1, 1, 0.1], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
            />
          ))}
          <p className="relative z-10 text-xs font-bold text-glow-300 tracking-widest uppercase bg-slate-900/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-glow-500/20">Live Data Network</p>
        </div>

        <div className="space-y-4 pb-6">
          <div className="flex items-start gap-4 bg-slate-800/50 p-4 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-glow-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Evidence-Based Solutions</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Scientists measure PM2.5 simultaneously on both the roadside and pedestrian side of the barrier to prove effectiveness.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-slate-800/50 p-4 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-glow-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Smarter Policy</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Research supports urban design decisions that actively reduce pollution exposure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Science Path (Vertical Infographic) */}
      <section className="p-6 py-12 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-slate-300 mb-4" />
          <h2 className="text-2xl font-display font-bold text-forest-900">The Science Path</h2>
          <p className="text-slate-500 text-sm">How we go from pollution to protection.</p>
        </div>

        <div className="relative space-y-16">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />

          {/* Step 1 */}
          <div className="relative flex items-start md:items-center gap-8 md:flex-row-reverse">
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-rose-500 border-4 border-white shadow-sm z-10 flex items-center justify-center text-[10px] font-bold text-white">1</div>
            <div className="flex-1 pl-12 md:pl-12 md:pr-0 md:text-right">
              <h4 className="font-bold text-slate-800">Pollution Source</h4>
              <p className="text-xs text-slate-500 mt-1">Cars and industry release PM2.5 particles into the urban air.</p>
            </div>
            <div className="hidden md:block flex-1" />
          </div>

          {/* Step 2 */}
          <div className="relative flex items-start md:items-center gap-8">
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-teal-500 border-4 border-white shadow-sm z-10 flex items-center justify-center text-[10px] font-bold text-white">2</div>
            <div className="flex-1 pl-12 md:pl-0 md:pr-12 md:text-left">
              <h4 className="font-bold text-slate-800">Green Barrier</h4>
              <p className="text-xs text-slate-500 mt-1">Vegetation traps particles and creates a "clean air zone" behind it.</p>
            </div>
            <div className="hidden md:block flex-1" />
          </div>

          {/* Step 3 */}
          <div className="relative flex items-start md:items-center gap-8 md:flex-row-reverse">
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-sky-500 border-4 border-white shadow-sm z-10 flex items-center justify-center text-[10px] font-bold text-white">3</div>
            <div className="flex-1 pl-12 md:pl-12 md:pr-0 md:text-right">
              <h4 className="font-bold text-slate-800">Data Collection</h4>
              <p className="text-xs text-slate-500 mt-1">Sensors measure the difference to prove the barrier's effectiveness.</p>
            </div>
            <div className="hidden md:block flex-1" />
          </div>

          {/* Step 4 */}
          <div className="relative flex items-start md:items-center gap-8">
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-forest-600 border-4 border-white shadow-sm z-10 flex items-center justify-center text-[10px] font-bold text-white">4</div>
            <div className="flex-1 pl-12 md:pl-0 md:pr-12 md:text-left">
              <h4 className="font-bold text-slate-800">Urban Impact</h4>
              <p className="text-xs text-slate-500 mt-1">Cities use this data to build healthier, greener neighborhoods for everyone.</p>
            </div>
            <div className="hidden md:block flex-1" />
          </div>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="p-6">
        <div className="bg-gradient-to-br from-forest-800 to-forest-600 rounded-3xl p-6 text-center shadow-xl border border-forest-500/30 max-w-2xl mx-auto">
          <h3 className="text-xl font-display font-bold mb-2 text-white">Be Part of the Solution</h3>
          <p className="text-sm text-forest-100 mb-6">Contribute to our global data collection and help your city breathe easier.</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate('form')}
              className="w-full bg-white text-forest-900 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors active:scale-[0.98]"
            >
              Contribute Data <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate('map')}
              className="w-full bg-forest-700/50 text-white py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-forest-700 transition-colors border border-forest-500/30 active:scale-[0.98]"
            >
              Explore Map Near You
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
