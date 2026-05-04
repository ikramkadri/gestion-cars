import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  val: number | string;
  unit: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const StatsCard = ({ label, val, unit, icon: Icon, color, bg }: StatsCardProps) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all group">
    <div className={`w-14 h-14 ${bg} rounded-[1.2rem] flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-black text-slate-900 leading-none">
        {typeof val === 'number' ? val.toLocaleString() : val} 
        <span className="text-[10px] text-slate-400 font-bold ml-1">{unit}</span>
      </h4>
    </div>
  </div>
);

export default StatsCard;



