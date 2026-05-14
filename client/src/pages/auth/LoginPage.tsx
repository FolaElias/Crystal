import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, RotateCcw, ChevronLeft } from 'lucide-react';
import { useLoginMutation, useVerifyLoginOtpMutation, useResendLoginOtpMutation } from '@/features/auth/authApi';
import { setCredentials } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/app/hooks';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCrystalSplash } from '@/contexts/CrystalSplashContext';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { triggerSplash } = useCrystalSplash();

  const [login, { isLoading: loggingIn }]           = useLoginMutation();
  const [verifyOtp, { isLoading: verifying }]        = useVerifyLoginOtpMutation();
  const [resendOtp, { isLoading: resending }]        = useResendLoginOtpMutation();

  // Step 1 state
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');

  // Step 2 state
  const [step, setStep]             = useState<'credentials' | 'otp'>('credentials');
  const [sessionId, setSessionId]   = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp]               = useState(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError]     = useState('');
  const [countdown, setCountdown]   = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-focus first OTP box when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ── Step 1: submit credentials ──────────────────────────────────────────
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(form).unwrap();
      if (result.data?.requiresOtp) {
        setSessionId(result.data.sessionId);
        setMaskedEmail(maskEmail(form.email));
        setStep('otp');
        setCountdown(RESEND_COOLDOWN);
      }
    } catch (err: unknown) {
      setError((err as { data?: { message?: string } })?.data?.message ?? 'Login failed');
    }
  };

  // ── Step 2: verify OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) { setOtpError('Please enter the full 6-digit code'); return; }
    setOtpError('');
    try {
      const result = await verifyOtp({ sessionId, otp: code }).unwrap();
      if (result.data?.accessToken) {
        dispatch(setCredentials({ accessToken: result.data.accessToken }));
        triggerSplash(() => navigate('/dashboard'));
      }
    } catch (err: unknown) {
      setOtpError((err as { data?: { message?: string } })?.data?.message ?? 'Invalid code');
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setOtpError('');
    try {
      await resendOtp({ sessionId }).unwrap();
      setCountdown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      setOtpError((err as { data?: { message?: string } })?.data?.message ?? 'Failed to resend');
    }
  };

  // ── OTP box key handlers ─────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = cleaned;
    setOtp(next);
    if (cleaned && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    // Auto-submit when all filled
    if (cleaned && index === OTP_LENGTH - 1 && next.every(Boolean)) {
      setTimeout(() => handleVerifyOtpWithCode(next.join('')), 80);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp]; next[index] = ''; setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...Array(OTP_LENGTH).fill('')];
    digits.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    const focusIdx = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (digits.length === OTP_LENGTH) setTimeout(() => handleVerifyOtpWithCode(digits), 80);
  };

  const handleVerifyOtpWithCode = async (code: string) => {
    setOtpError('');
    try {
      const result = await verifyOtp({ sessionId, otp: code }).unwrap();
      if (result.data?.accessToken) {
        dispatch(setCredentials({ accessToken: result.data.accessToken }));
        triggerSplash(() => navigate('/dashboard'));
      }
    } catch (err: unknown) {
      setOtpError((err as { data?: { message?: string } })?.data?.message ?? 'Invalid code');
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-5 sm:p-8 border border-neon-cyan/15 shadow-card-glow relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-neon-gradient" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t border-r border-neon-cyan/20 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b border-l border-neon-cyan/20 rounded-bl-xl pointer-events-none" />

      {/* ── Step 1: Credentials ── */}
      {step === 'credentials' && (
        <div className="animate-slide-up">
          <div className="mb-7">
            <h2 className="text-xl font-bold tracking-wide">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your Crystal account</p>
          </div>

          <form onSubmit={handleCredentials} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={form.email}
              onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setError(''); }}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              showPasswordToggle
              value={form.password}
              onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setError(''); }}
              required
            />

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-neon-red/10 border border-neon-red/25 text-neon-red text-sm animate-slide-up">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-red flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full group" disabled={loggingIn}>
              {loggingIn
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                : <><span>Continue</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              }
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-crystal-border">
            <p className="text-center text-sm text-muted-foreground">
              No account yet?{' '}
              <Link to="/register" className="text-neon-cyan hover:text-white font-semibold transition-colors">
                Create one →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ── Step 2: OTP ── */}
      {step === 'otp' && (
        <div className="animate-slide-up">
          <button
            onClick={() => { setStep('credentials'); setOtp(Array(OTP_LENGTH).fill('')); setOtpError(''); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-neon-cyan transition-colors mb-6"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-neon-cyan/20 animate-pulse-ring" />
              <div className="relative w-16 h-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shadow-neon-cyan">
                <ShieldCheck className="w-7 h-7 text-neon-cyan" />
              </div>
            </div>
          </div>

          <div className="text-center mb-7">
            <h2 className="text-xl font-bold tracking-wide">Check your email</h2>
            <p className="text-sm text-muted-foreground mt-2">
              We sent a 6-digit code to
            </p>
            <p className="text-sm font-semibold text-neon-cyan mt-0.5">{maskedEmail}</p>
          </div>

          {/* OTP boxes */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className={[
                  'w-11 h-13 sm:w-12 sm:h-14 rounded-xl border-2 bg-crystal-surface text-center',
                  'text-xl font-bold font-mono text-foreground',
                  'transition-all duration-200 focus:outline-none',
                  'placeholder:text-muted-foreground/30',
                  digit
                    ? 'border-neon-cyan text-neon-cyan shadow-neon-cyan bg-neon-cyan/5'
                    : 'border-crystal-border hover:border-neon-cyan/30 focus:border-neon-cyan focus:shadow-neon-cyan',
                  otpError && 'border-neon-red focus:border-neon-red',
                ].join(' ')}
              />
            ))}
          </div>

          {otpError && (
            <div className="flex items-center justify-center gap-2 mb-4 text-neon-red text-sm animate-slide-up">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-red flex-shrink-0" />
              {otpError}
            </div>
          )}

          <Button
            size="lg"
            className="w-full group"
            disabled={verifying || otp.join('').length < OTP_LENGTH}
            onClick={handleVerifyOtp}
          >
            {verifying
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              : <><span>Verify & Sign In</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
            }
          </Button>

          {/* Resend */}
          <div className="flex items-center justify-center gap-2 mt-5 text-sm">
            <span className="text-muted-foreground">Didn't receive it?</span>
            {countdown > 0 ? (
              <span className="text-muted-foreground font-mono">
                Resend in <span className="text-neon-cyan">{countdown}s</span>
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5 text-neon-cyan hover:text-white font-semibold transition-colors disabled:opacity-50"
              >
                {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                Resend code
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  const visible = Math.min(3, Math.floor(user.length / 2));
  return `${user.slice(0, visible)}${'•'.repeat(user.length - visible)}@${domain}`;
}
