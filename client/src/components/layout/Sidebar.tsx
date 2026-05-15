import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, ArrowLeftRight, BarChart2,
  History, Settings, LogOut, Zap, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/app/hooks';
import { clearAuth } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';
import { useCrystalSplash } from '@/contexts/CrystalSplashContext';
import { LogoutModal } from '@/components/ui/LogoutModal';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/wallet',    icon: Wallet,          label: 'Wallet'    },
  { to: '/trade',     icon: BarChart2,        label: 'Trade'     },
  { to: '/transfer',  icon: ArrowLeftRight,   label: 'Transfer'  },
  { to: '/history',   icon: History,          label: 'History'   },
  { to: '/settings',  icon: Settings,         label: 'Settings'  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { triggerSplash } = useCrystalSplash();
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const [showModal, setShowModal] = useState(false);

  const handleLogoutConfirm = async () => {
    await logout().catch(() => null);
    dispatch(clearAuth());
    setShowModal(false);
    triggerSplash(() => navigate('/login'));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-neon-gradient opacity-60" />

      {/* Logo */}
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="absolute inset-0 rounded-lg bg-neon-gradient animate-spin-slow opacity-80" />
              <div className="absolute inset-[2px] rounded-lg bg-crystal-card flex items-center justify-center">
                <Zap className="w-4 h-4 text-neon-cyan" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold gradient-text-cyan tracking-widest">CRYSTAL</span>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Crypto Wallet</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden text-muted-foreground hover:text-neon-cyan transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 mt-4 px-2 py-1.5 rounded-lg bg-neon-green/5 border border-neon-green/15">
          <span className="relative flex w-2 h-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-60" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-neon-green" />
          </span>
          <span className="text-[10px] text-neon-green font-semibold tracking-widest">ALL SYSTEMS ONLINE</span>
        </div>
      </div>

      <div className="px-3 mb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }, i) => (
          <NavLink
            key={to}
            to={to}
            onClick={onMobileClose}
            style={{ animationDelay: `${i * 60}ms` }}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden',
                isActive
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/25 shadow-neon-cyan'
                  : 'text-muted-foreground border border-transparent hover:bg-crystal-hover hover:text-neon-cyan hover:border-neon-cyan/15'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-neon-cyan rounded-full shadow-neon-cyan" />
                )}
                <Icon className={cn('w-4 h-4 flex-shrink-0 transition-all duration-200', isActive ? 'text-neon-cyan' : 'group-hover:text-neon-cyan group-hover:scale-110')} />
                <span className="tracking-wide">{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-neon-cyan" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 mb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
      </div>

      {/* Logout */}
      <div className="p-3 pb-6">
        <button
          onClick={() => setShowModal(true)}
          className="group flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground border border-transparent hover:bg-neon-red/10 hover:text-neon-red hover:border-neon-red/25 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          <span className="tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 z-30 flex-col glass-strong border-r border-neon-cyan/10">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-screen w-72 z-50 flex flex-col glass-strong border-r border-neon-cyan/10',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      <LogoutModal
        isOpen={showModal}
        isLoading={loggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}
