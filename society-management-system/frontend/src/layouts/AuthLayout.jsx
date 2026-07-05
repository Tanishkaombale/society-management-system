import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-paper">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-navy-dark text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-amber flex items-center justify-center text-navy-dark">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="font-display text-xl leading-none">Sentinel</p>
            <p className="text-[10px] tracking-widest text-white/50 uppercase">Society OS</p>
          </div>
        </div>

        <div className="relative">
          <p className="font-display text-4xl leading-tight mb-4">
            The ledger for every gate,<br /> flat, and notice board.
          </p>
          <p className="text-white/60 text-sm max-w-sm">
            One record for residents, dues, visitors, and complaints — kept the way a good
            society secretary would keep it, just faster.
          </p>
        </div>

        <div className="relative text-white/40 text-xs">
          &copy; {new Date().getFullYear()} Sentinel Society Management System
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-9 w-9 rounded-md bg-navy flex items-center justify-center text-white">
              <ShieldCheck size={18} />
            </div>
            <p className="font-display text-lg text-navy-dark">Sentinel</p>
          </div>
          <p className="label-eyebrow mb-2">{subtitle}</p>
          <h1 className="font-display text-2xl text-navy-dark mb-6">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
