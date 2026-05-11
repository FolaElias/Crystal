import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useLoginMutation } from '@/features/auth/authApi';
import { setCredentials } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/app/hooks';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm] = useState({ email: '', password: '', totpCode: '' });
  const [error, setError] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(form).unwrap();
      if (result.data?.accessToken) {
        dispatch(setCredentials({ accessToken: result.data.accessToken }));
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Login failed';
      if (msg.includes('2FA')) setNeeds2FA(true);
      setError(msg);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-5 sm:p-8 border border-neon-cyan/15 shadow-card-glow relative overflow-hidden">
      {/* top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-neon-gradient" />

      {/* corner decoration */}
      <div className="absolute top-4 right-4 w-16 h-16 border-t border-r border-neon-cyan/20 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b border-l border-neon-cyan/20 rounded-bl-xl pointer-events-none" />

      <div className="mb-7">
        <h2 className="text-xl font-bold text-foreground tracking-wide">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your Crystal account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          required
        />
        {needs2FA && (
          <div className="animate-slide-up">
            <Input
              label="2FA Authentication Code"
              type="text"
              placeholder="000 000"
              icon={<ShieldCheck className="w-4 h-4" />}
              maxLength={6}
              value={form.totpCode}
              onChange={(e) => setForm((p) => ({ ...p, totpCode: e.target.value }))}
            />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-neon-red/10 border border-neon-red/25 text-neon-red text-sm animate-slide-up">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-red flex-shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full mt-2 group" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
          ) : (
            <><span>Sign In</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
          )}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-crystal-border">
        <p className="text-center text-sm text-muted-foreground">
          No account yet?{' '}
          <Link to="/register" className="text-neon-cyan hover:text-white font-semibold transition-colors hover:text-glow-cyan">
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
