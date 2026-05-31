import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  val: number | string;
  unit: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const StatsCard = ({ label, val, unit, icon: Icon, color, bg }: StatsCardProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all group"
  >
    <div className={`w-14 h-14 ${bg} rounded-[1.2rem] flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-black text-card-foreground leading-none tabular-nums">
        {typeof val === 'number' ? val.toLocaleString() : val} 
        <span className="text-[10px] text-muted-foreground font-bold mx-1">{unit}</span>
      </h4>
    </div>
  </motion.div>
);

export default StatsCard;
