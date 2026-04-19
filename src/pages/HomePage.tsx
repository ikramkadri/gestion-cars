import React from 'react';
import { ArrowRight, ChevronDown, Car, ShieldCheck, Zap } from 'lucide-react';

const App = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      {/* Navbar Minimalist */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Car size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">Motorix</span>
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Models</a>
          <a href="#" className="hover:text-white transition-colors">Inventory</a>
          <a href="#" className="hover:text-white transition-colors">Experience</a>
        </div>

        <button className="px-5 py-2 rounded-full border border-gray-700 hover:bg-white hover:text-black transition-all text-sm font-semibold">
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10"></div>
          {/* صورة السيارة الكبيرة - هنا وضعت رابط لصورة احترافية كمثال */}
          <img 
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop" 
            alt="Luxury Car" 
            className="w-full h-full object-cover opacity-60 scale-105 animate-[subtle-zoom_20s_infinite]"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-6 backdrop-blur-md">
            <Zap size={14} />
            <span>The Future of Driving is Here</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            FIND YOUR <br /> DREAM CAR
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Experience the pinnacle of automotive excellence. Motorix brings you curated luxury and performance at your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="group relative px-8 py-4 bg-white text-black rounded-full font-bold overflow-hidden transition-all hover:pr-12">
              <span className="relative z-10">Browse Inventory</span>
              <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </button>
            
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold transition-all backdrop-blur-md">
              Book a Test Drive
            </button>
          </div>
        </div>

        {/* Bottom Specs (Premium Detail) */}
        <div className="absolute bottom-12 left-0 w-full z-20 px-8 hidden lg:flex justify-between items-end">
           <div className="flex gap-12">
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Top Speed</p>
                <p className="text-2xl font-light">320 <span className="text-xs text-gray-400">km/h</span></p>
              </div>
              <div className="text-left border-l border-white/10 pl-12">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">0-100 km/h</p>
                <p className="text-2xl font-light">2.4 <span className="text-xs text-gray-400">sec</span></p>
              </div>
           </div>

           <div className="animate-bounce cursor-pointer flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Explore</span>
              <ChevronDown size={20} className="text-white/50" />
           </div>

           <div className="flex items-center gap-2 text-indigo-400">
              <ShieldCheck size={18} />
              <span className="text-xs font-semibold tracking-wider">SECURED BY MOTORIX</span>
           </div>
        </div>
      </section>

      {/* Features Grid (Brief) */}
      <section className="bg-black py-24 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Car size={24} />
            </div>
            <h3 className="text-xl font-bold">Premium Selection</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Hand-picked vehicles that meet our rigorous 200-point inspection standards.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold">Full Protection</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Extended warranties and service plans tailored to your premium lifestyle.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold">Fast Delivery</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Seamless paperwork and concierge delivery to your doorstep in 48 hours.</p>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtle-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
      ` }} />
    </div>
  );
};

export default App;