import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const goToDestination = (name) => {
    toast.success(`Welcome back, ${name.split(' ')[0]}`);
    const dest = location.state?.from?.pathname || '/dashboard';
    navigate(dest, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      goToDestination(user.name);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(async (credential) => {
    try {
      const data = await loginWithGoogle(credential);
      if (data.user) {
        goToDestination(data.user.name);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed. If you\'re new, register first.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthLayout subtitle="Welcome back" title="Sign in to your account">
      <GoogleAuthButton onCredential={handleGoogleCredential} />

      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-ink-soft">or sign in with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink">Email address</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@society.com"
            className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Password</label>
          <div className="relative mt-1.5">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
        >
          <LogIn size={16} />
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-ink-soft mt-6 text-center">
        New here?{' '}
        <Link to="/register" className="text-navy font-medium hover:underline">
          Create or join a society
        </Link>
      </p>

      <div className="mt-8 p-3.5 rounded-lg bg-amber-soft/50 border border-amber/30 text-xs text-ink-soft space-y-1">
        <p className="font-semibold text-navy-dark">Demo credentials (after seeding)</p>
        <p>Admin — admin@society.com / Admin@123 <span className="text-ink-soft/70">(Sunrise Residency)</span></p>
        <p>Security — security@society.com / Security@123</p>
        <p>Resident — resident@society.com / Resident@123</p>
      </div>
    </AuthLayout>
  );
}
