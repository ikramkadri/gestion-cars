import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 gap-4">
      <Loader2 className="animate-spin text-blue-500" size={48} />
      <div className="text-blue-500 font-black text-xl tracking-tighter animate-pulse uppercase">MOTORIX</div>
    </div>
  );
};

export default LoadingScreen;