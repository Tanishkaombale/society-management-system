import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, UserPlus, KeyRound, CheckCircle2, Loader2 } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/endpoints';

const TABS = [
  { key: 'create', label: 'Create a society', icon: Building2 },
  { key: 'join', label: 'Join a society', icon: KeyRound },
];

export default function Register() {
  const { createSociety, joinSociety, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [loading, setLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '', email: '', password: '', phone: '', societyName: '', address: '', city: '',
  });
  const [joinForm, setJoinForm] = useState({
    name: '', email: '', password: '', phone: '', societyCode: '',
  });

  // Live-preview the society name as the resident types a join code.
  const [codePreview, setCodePreview] = useState(null); // null = unchecked, false = not found, object = found
  const [checkingCode, setCheckingCode] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (tab !== 'join') return;
    const code = joinForm.societyCode.trim();
    clearTimeout(debounceRef.current);
    if (code.length < 4) {
      setCodePreview(null);
      return;
    }
    setCheckingCode(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.lookupSocietyByCode(code);
        setCodePreview(data.society);
      } catch {
        setCodePreview(false);
      } finally {
        setCheckingCode(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [joinForm.societyCode, tab]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await createSociety(createForm);
      toast.success(data.message || 'Society created');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create society');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await joinSociety(joinForm);
      toast.success(data.message || 'Join request submitted');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit join request');
    } finally {
      setLoading(false);
    }
  };

  // The Google button submits independently of the form, so it reads whichever
  // tab's fields are currently filled in.
  const handleGoogleCredential = useCallback(
    async (credential) => {
      try {
        if (tab === 'create') {
          if (!createForm.societyName.trim()) {
            toast.error('Enter a society name first, then continue with Google');
            return;
          }
          const data = await loginWithGoogle(credential, {
            intent: 'create',
            societyName: createForm.societyName,
            address: createForm.address,
            city: createForm.city,
            phone: createForm.phone,
          });
          if (data.user) {
            toast.success(data.message || 'Society created');
            navigate('/dashboard');
          }
        } else {
          if (!joinForm.societyCode.trim()) {
            toast.error('Enter your society join code first, then continue with Google');
            return;
          }
          const data = await loginWithGoogle(credential, {
            intent: 'join',
            societyCode: joinForm.societyCode,
            phone: joinForm.phone,
          });
          if (data.pendingApproval) {
            toast.success(data.message);
            navigate('/login');
          } else if (data.user) {
            navigate('/dashboard');
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google sign-up failed');
      }
    },
    [tab, createForm, joinForm, loginWithGoogle, navigate]
  );

  return (
    <AuthLayout subtitle="Get started" title="Set up your account">
      <div className="grid grid-cols-2 gap-2 mb-6 bg-paper p-1 rounded-lg border border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-surface text-navy-dark shadow-sm border border-border' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <GoogleAuthButton
        key={tab}
        onCredential={handleGoogleCredential}
        text={tab === 'create' ? 'signup_with' : 'continue_with'}
      />

      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-ink-soft">or use your email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {tab === 'create' ? (
        <form onSubmit={handleCreateSubmit} className="space-y-3.5">
          <p className="text-xs text-ink-soft -mt-1 mb-1">
            You'll become the admin of this society and get a join code to share with residents.
          </p>
          <div>
            <label className="text-sm font-medium text-ink">Society name</label>
            <input
              required
              placeholder="e.g. Sunrise Residency"
              value={createForm.societyName}
              onChange={(e) => setCreateForm({ ...createForm, societyName: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">City (optional)</label>
              <input
                value={createForm.city}
                onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Address (optional)</label>
              <input
                value={createForm.address}
                onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>

          <div className="h-px bg-border my-1" />

          <div>
            <label className="text-sm font-medium text-ink">Your full name</label>
            <input
              required
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Phone</label>
              <input
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60 mt-2"
          >
            <Building2 size={16} />
            {loading ? 'Creating…' : 'Create society & continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoinSubmit} className="space-y-3.5">
          <p className="text-xs text-ink-soft -mt-1 mb-1">
            Ask your society admin for the join code, then request access below.
          </p>
          <div>
            <label className="text-sm font-medium text-ink">Society join code</label>
            <input
              required
              placeholder="e.g. K7M2QP"
              value={joinForm.societyCode}
              onChange={(e) => setJoinForm({ ...joinForm, societyCode: e.target.value.toUpperCase() })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
            <div className="mt-1.5 h-5 text-xs">
              {checkingCode && (
                <span className="flex items-center gap-1 text-ink-soft">
                  <Loader2 size={12} className="animate-spin" /> Checking code…
                </span>
              )}
              {!checkingCode && codePreview && (
                <span className="flex items-center gap-1 text-success font-medium">
                  <CheckCircle2 size={13} /> {codePreview.name}{codePreview.city ? ` · ${codePreview.city}` : ''}
                </span>
              )}
              {!checkingCode && codePreview === false && (
                <span className="text-danger">No society found with this code</span>
              )}
            </div>
          </div>

          <div className="h-px bg-border my-1" />

          <div>
            <label className="text-sm font-medium text-ink">Your full name</label>
            <input
              required
              value={joinForm.name}
              onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                required
                value={joinForm.email}
                onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Phone</label>
              <input
                value={joinForm.phone}
                onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={joinForm.password}
              onChange={(e) => setJoinForm({ ...joinForm, password: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy-light text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60 mt-2"
          >
            <UserPlus size={16} />
            {loading ? 'Submitting…' : 'Request to join'}
          </button>
        </form>
      )}

      <p className="text-sm text-ink-soft mt-6 text-center">
        Already registered?{' '}
        <Link to="/login" className="text-navy font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
