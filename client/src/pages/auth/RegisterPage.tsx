import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useRegisterMutation, useCheckUsernameQuery } from '@/features/auth/authApi';
import { setCredentials } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/app/hooks';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounced username for availability check
  const [debouncedUsername, setDebouncedUsername] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedUsername(form.username.trim()), 500);
    return () => clearTimeout(t);
  }, [form.username]);

  const { data: usernameCheck, isFetching: checkingUsername } = useCheckUsernameQuery(
    debouncedUsername,
    { skip: debouncedUsername.length < 3 }
  );
  const usernameAvailable = usernameCheck?.data?.available;
  const showUsernameStatus = debouncedUsername.length >= 3;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.password.length < 8)
      next.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword)
      next.confirmPassword = 'Passwords do not match';
    if (showUsernameStatus && usernameAvailable === false)
      next.username = 'Username is already taken';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    try {
      const { confirmPassword: _confirm, ...payload } = form;
      const result = await register(payload).unwrap();
      if (result.data?.accessToken) {
        dispatch(setCredentials({ accessToken: result.data.accessToken }));
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const e = err as { data?: { errors?: Record<string, string[]>; message?: string } };
      if (e?.data?.errors) {
        setErrors(Object.fromEntries(Object.entries(e.data.errors).map(([k, v]) => [k, v[0]])));
      } else {
        setErrors({ general: e?.data?.message ?? 'Registration failed' });
      }
    }
  };

  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [name]: e.target.value }));
      if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    },
    error: errors[name],
  });

  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  return (
    <div className="glass-strong rounded-2xl p-5 sm:p-8 border border-neon-cyan/15 shadow-card-glow relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-neon-gradient" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t border-r border-neon-cyan/20 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b border-l border-neon-cyan/20 rounded-bl-xl pointer-events-none" />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground tracking-wide">Create Account</h2>
        <p className="text-sm text-muted-foreground mt-1">Join Crystal and start trading</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            icon={<User className="w-3.5 h-3.5" />}
            required
            {...field('firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            required
            {...field('lastName')}
          />
        </div>

        {/* Username with real-time availability */}
        <div className="relative">
          <Input
            label="Username"
            placeholder="johndoe"
            icon={<User className="w-4 h-4" />}
            required
            {...field('username')}
          />
          {/* Availability badge */}
          {form.username.length >= 3 && (
            <div className="absolute right-0 top-0 flex items-center gap-1 text-xs font-semibold">
              {checkingUsername || debouncedUsername !== form.username.trim() ? (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking...
                </span>
              ) : usernameAvailable ? (
                <span className="flex items-center gap-1 text-neon-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Available
                </span>
              ) : (
                <span className="flex items-center gap-1 text-neon-red">
                  <XCircle className="w-3.5 h-3.5" />
                  Taken
                </span>
              )}
            </div>
          )}
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          required
          {...field('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          icon={<Lock className="w-4 h-4" />}
          showPasswordToggle
          required
          {...field('password')}
        />

        <div className="relative">
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            icon={<Lock className="w-4 h-4" />}
            showPasswordToggle
            required
            {...field('confirmPassword')}
          />
          {form.confirmPassword.length > 0 && (
            <div className={`absolute right-0 top-0 text-xs font-semibold transition-colors ${
              passwordsMatch ? 'text-neon-green' : 'text-neon-red'
            }`}>
              {passwordsMatch ? '✓ Match' : '✗ No match'}
            </div>
          )}
        </div>

        {errors.general && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-neon-red/10 border border-neon-red/25 text-neon-red text-sm animate-slide-up">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-red flex-shrink-0" />
            {errors.general}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2 group"
          disabled={isLoading}
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
          ) : (
            <><span>Create Account</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
          )}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-crystal-border">
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-neon-cyan hover:text-white font-semibold transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
