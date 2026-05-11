import { Outlet } from 'react-router-dom';
import { ParticleBackground } from '../effects/ParticleBackground';
import { Zap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-crystal-bg bg-grid flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <ParticleBackground />

      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-float delay-300 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up my-4 sm:my-0">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="relative w-11 h-11">
              <div className="absolute inset-0 rounded-xl bg-neon-gradient animate-spin-slow opacity-80" />
              <div className="absolute inset-[2px] rounded-xl bg-crystal-card flex items-center justify-center">
                <Zap className="w-5 h-5 text-neon-cyan" />
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text-cyan tracking-widest">CRYSTAL</h1>
          </div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Next-Gen Crypto Wallet
          </p>
          <div className="mt-3 h-px w-32 mx-auto bg-neon-gradient opacity-50 rounded-full" />
        </div>

        <Outlet />
      </div>
    </div>
  );
}
