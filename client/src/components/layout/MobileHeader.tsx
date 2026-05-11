import { Menu, Zap, Bell } from 'lucide-react';

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 glass-strong border-b border-neon-cyan/10">
      <button
        onClick={onMenuOpen}
        className="p-2 rounded-lg text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/10 border border-transparent hover:border-neon-cyan/20 transition-all duration-200"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="relative w-7 h-7">
          <div className="absolute inset-0 rounded-lg bg-neon-gradient animate-spin-slow opacity-80" />
          <div className="absolute inset-[2px] rounded-lg bg-crystal-card flex items-center justify-center">
            <Zap className="w-3 h-3 text-neon-cyan" />
          </div>
        </div>
        <span className="text-base font-bold gradient-text-cyan tracking-widest">CRYSTAL</span>
      </div>

      <button className="relative p-2 rounded-lg text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/10 border border-transparent hover:border-neon-cyan/20 transition-all duration-200">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neon-red shadow-neon-red" />
      </button>
    </header>
  );
}
