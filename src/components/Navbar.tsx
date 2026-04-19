import React from 'react';
import { Car as CarIcon, Search, Bell } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Navbar = ({ searchQuery, setSearchQuery }: NavbarProps) => (
  <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-5 sticky top-0 z-[60]">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3">
          <CarIcon size={26} />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-2xl font-black tracking-tighter uppercase leading-none">MOTORIX<span className="text-indigo-600"> PRO</span></span>
          <span className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">إدارة المخزون الذكية</span>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 max-w-xl mx-12">
        <div className="relative w-full group">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="ابحث بواسطة الماركة أو الموديل..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/80 border-2 border-transparent rounded-2xl py-3.5 pr-14 pl-5 text-sm font-bold focus:bg-white focus:border-indigo-500/20 outline-none transition-all shadow-inner text-right" 
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-3 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">
          <Bell size={22} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-12 h-12 rounded-[1.2rem] overflow-hidden border-2 border-indigo-100 shadow-md cursor-pointer hover:scale-105 transition-transform">
          <img src="https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff" alt="Admin" />
        </div>
      </div>
    </div>
  </nav>
);

export default Navbar;