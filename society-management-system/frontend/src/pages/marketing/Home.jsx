import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Menu, X, Users, Building2, Megaphone, MessageSquareWarning,
  UserCheck, Receipt, CalendarClock, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const features = [
  {
    icon: Users,
    title: 'Residents & staff',
    description: 'Approve new residents, onboard security staff, and keep every household record in one directory.',
  },
  {
    icon: Building2,
    title: 'Flats & blocks',
    description: 'Track every unit across blocks — type, floor, occupancy, and monthly maintenance rate.',
  },
  {
    icon: Megaphone,
    title: 'Notice board',
    description: 'Publish announcements, mark them important, and reach every resident instantly.',
  },
  {
    icon: MessageSquareWarning,
    title: 'Complaint tracking',
    description: 'Residents raise issues, staff update status, and every reply is kept on a single thread.',
  },
  {
    icon: UserCheck,
    title: 'Visitor gate log',
    description: 'Security logs entries and exits against the exact flat being visited, in real time.',
  },
  {
    icon: Receipt,
    title: 'Maintenance billing',
    description: 'Generate monthly invoices per flat and let residents settle dues online.',
  },
  {
    icon: CalendarClock,
    title: 'Amenity bookings',
    description: 'Clubhouse, pool, courts — residents book slots, admins approve, no double-bookings.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    description: 'Admin, resident, and security each see exactly what they need — enforced on the server, not just the UI.',
  },
];

const roles = [
  {
    name: 'Admin',
    tagline: 'Runs the society',
    points: ['Approve residents & assign flats', 'Publish notices', 'Resolve complaints', 'Generate maintenance bills', 'Approve amenity bookings'],
  },
  {
    name: 'Resident',
    tagline: 'Lives in the society',
    points: ['Read notices', 'Raise & track complaints', 'Pay maintenance dues', 'Book amenities'],
  },
  {
    name: 'Security',
    tagline: 'Guards the gate',
    points: ['Log visitor entry & exit', 'View active visitors', 'Read notices'],
  },
];

const steps = [
  { step: '01', title: 'Create or join', text: 'Admins create their society and get a join code; residents enter that code to request access.' },
  { step: '02', title: 'Admin approves', text: 'The admin reviews join requests, approves residents, and assigns them to a flat.' },
  { step: '03', title: 'Everyone stays in sync', text: 'Complaints, dues, and visitor logs update in real time for every role — scoped to your society only.' },
];

/** Fades + slides a section up into place the first time it scrolls into view. */
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '700ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      <style>{`
        @keyframes sentinel-float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(12px, -18px) rotate(6deg); }
        }
        @keyframes sentinel-float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-16px, 14px) scale(1.05); }
        }
        @keyframes sentinel-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(232, 163, 61, 0.45); }
          100% { box-shadow: 0 0 0 14px rgba(232, 163, 61, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sentinel-blob-1, .sentinel-blob-2, .sentinel-logo-ring:hover { animation: none !important; }
        }
        .sentinel-blob-1 { animation: sentinel-float 9s ease-in-out infinite; }
        .sentinel-blob-2 { animation: sentinel-float-slow 11s ease-in-out infinite; }
        .sentinel-logo-ring:hover { animation: sentinel-pulse-ring 1.1s ease-out infinite; }
        .sentinel-cta-arrow { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .sentinel-cta:hover .sentinel-cta-arrow { transform: translateX(5px); }
        .sentinel-cta { transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease; }
        .sentinel-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -8px rgba(22, 50, 79, 0.35); }
        .sentinel-cta:active { transform: translateY(0); }
        .sentinel-feature-card { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease; }
        .sentinel-feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 34px -18px rgba(22, 50, 79, 0.28); border-color: rgba(232, 163, 61, 0.55); }
        .sentinel-feature-icon { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease, color 0.3s ease; }
        .sentinel-feature-card:hover .sentinel-feature-icon { transform: rotate(-8deg) scale(1.12); background-color: var(--color-amber-soft); color: var(--color-amber-dark); }
        .sentinel-role-card { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, background-color 0.3s ease; }
        .sentinel-role-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 22px 40px -16px rgba(0,0,0,0.45); background-color: rgba(255,255,255,0.08); }
        .sentinel-role-check { transition: transform 0.25s ease; }
        .sentinel-role-card:hover .sentinel-role-check { transform: scale(1.2); }
        .sentinel-step-card { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease; }
        .sentinel-step-card:hover { transform: translateY(-6px) rotate(-0.4deg); box-shadow: 0 20px 34px -18px rgba(22, 50, 79, 0.28); }
        .sentinel-step-num { transition: color 0.3s ease, transform 0.3s ease; }
        .sentinel-step-card:hover .sentinel-step-num { color: var(--color-navy); transform: scale(1.08); }
        .sentinel-navlink { position: relative; }
        .sentinel-navlink::after {
          content: ''; position: absolute; left: 0; right: 100%; bottom: -3px; height: 2px;
          background: var(--color-amber); transition: right 0.25s ease;
        }
        .sentinel-navlink:hover::after { right: 0; }
        .sentinel-badge { transition: transform 0.3s ease; }
        .sentinel-badge:hover { transform: scale(1.05); }
      `}</style>

      {/* Top nav */}
      <header
        className={`sticky top-0 z-40 bg-surface/90 backdrop-blur border-b transition-shadow duration-300 ${
          scrolled ? 'border-border shadow-sm' : 'border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="sentinel-logo-ring h-8 w-8 rounded-md bg-navy flex items-center justify-center text-white transition-transform duration-300 hover:scale-110">
              <ShieldCheck size={17} />
            </div>
            <div>
              <p className="font-display text-base leading-none text-navy-dark">Sentinel</p>
              <p className="text-[9px] tracking-widest text-ink-soft uppercase">Society OS</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-ink-soft">
            <a href="#features" className="sentinel-navlink hover:text-ink transition-colors">Features</a>
            <a href="#roles" className="sentinel-navlink hover:text-ink transition-colors">Who it's for</a>
            <a href="#how-it-works" className="sentinel-navlink hover:text-ink transition-colors">How it works</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="sentinel-cta flex items-center gap-1.5 bg-navy hover:bg-navy-light text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                Go to dashboard <ArrowRight size={15} className="sentinel-cta-arrow" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-ink hover:text-navy transition-colors px-3 py-2">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="sentinel-cta bg-navy hover:bg-navy-light text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-ink transition-transform duration-200 active:scale-90"
            onClick={() => setMenuOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-5 py-4 space-y-3 animate-fade-in">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm text-ink-soft">Features</a>
            <a href="#roles" onClick={() => setMenuOpen(false)} className="block text-sm text-ink-soft">Who it's for</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm text-ink-soft">How it works</a>
            <div className="flex gap-3 pt-2">
              {user ? (
                <Link to="/dashboard" className="flex-1 text-center bg-navy text-white text-sm font-medium px-4 py-2.5 rounded-lg">
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="flex-1 text-center border border-border text-sm font-medium px-4 py-2.5 rounded-lg text-ink">
                    Log in
                  </Link>
                  <Link to="/register" className="flex-1 text-center bg-navy text-white text-sm font-medium px-4 py-2.5 rounded-lg">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #16324f 1px, transparent 0)',
            backgroundSize: '28px 28px',
            maskImage: 'linear-gradient(to bottom, black, transparent)',
          }}
        />
        {/* Floating decorative shapes */}
        <div
          className="sentinel-blob-1 absolute -top-6 right-[8%] h-20 w-20 rounded-2xl bg-amber-soft/70 pointer-events-none hidden sm:block"
          aria-hidden="true"
        />
        <div
          className="sentinel-blob-2 absolute top-32 left-[6%] h-14 w-14 rounded-full bg-navy/10 pointer-events-none hidden sm:block"
          aria-hidden="true"
        />
        <div
          className="sentinel-blob-1 absolute bottom-8 right-[18%] h-10 w-10 rounded-full bg-navy/10 pointer-events-none hidden sm:block"
          style={{ animationDelay: '1.4s' }}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          <Reveal>
            <div className="sentinel-badge inline-flex items-center gap-2 bg-amber-soft text-amber-dark text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <CheckCircle2 size={14} /> One platform, unlimited societies — each with its own private data
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-navy-dark leading-tight max-w-3xl mx-auto">
              The ledger for every gate, flat, and notice board.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-ink-soft text-base md:text-lg max-w-xl mx-auto mt-5">
              One record for residents, dues, visitors, and complaints — kept the way a good
              society secretary would keep it, just faster.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
              <Link
                to={user ? '/dashboard' : '/register'}
                className="sentinel-cta flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-medium px-6 py-3 rounded-lg"
              >
                {user ? 'Go to dashboard' : 'Get started free'} <ArrowRight size={17} className="sentinel-cta-arrow" />
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="sentinel-cta flex items-center gap-2 bg-surface border border-border hover:border-navy/30 text-ink font-medium px-6 py-3 rounded-lg"
                >
                  I already have an account
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <Reveal>
          <p className="label-eyebrow text-center mb-2">Everything in one place</p>
          <h2 className="font-display text-2xl md:text-3xl text-navy-dark text-center mb-12">
            Every part of running a society, covered
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 70}>
              <div className="sentinel-feature-card ledger-card p-5 h-full cursor-default">
                <div className="sentinel-feature-icon p-2.5 rounded-lg bg-navy/5 text-navy inline-flex mb-3">
                  <f.icon size={20} />
                </div>
                <p className="font-display text-base text-navy-dark">{f.title}</p>
                <p className="text-sm text-ink-soft mt-1.5">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-navy-dark text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <Reveal>
            <p className="label-eyebrow text-white/50 text-center mb-2">Built for three kinds of people</p>
            <h2 className="font-display text-2xl md:text-3xl text-center mb-12">Who it's for</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {roles.map((r, i) => (
              <Reveal key={r.name} delay={i * 100}>
                <div className="sentinel-role-card bg-white/5 border border-white/10 rounded-xl p-6 h-full cursor-default">
                  <p className="font-display text-xl">{r.name}</p>
                  <p className="text-white/50 text-sm mb-4">{r.tagline}</p>
                  <ul className="space-y-2.5">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-white/80">
                        <CheckCircle2 size={15} className="sentinel-role-check text-amber shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <Reveal>
          <p className="label-eyebrow text-center mb-2">Simple to adopt</p>
          <h2 className="font-display text-2xl md:text-3xl text-navy-dark text-center mb-12">How it works</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 100}>
              <div className="sentinel-step-card ledger-card accent-amber p-6 h-full cursor-default">
                <p className="sentinel-step-num stat-figure text-3xl text-amber-dark">{s.step}</p>
                <p className="font-display text-lg text-navy-dark mt-3">{s.title}</p>
                <p className="text-sm text-ink-soft mt-1.5">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-20">
        <Reveal>
          <div className="ledger-card p-10 md:p-14 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-navy-dark">Ready to bring order to your society?</h2>
            <p className="text-ink-soft mt-3 max-w-lg mx-auto">
              Create your account and get your first notice, flat, and complaint logged in minutes.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <Link
                to={user ? '/dashboard' : '/register'}
                className="sentinel-cta flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-medium px-6 py-3 rounded-lg"
              >
                {user ? 'Go to dashboard' : 'Create your account'} <ArrowRight size={17} className="sentinel-cta-arrow" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-soft">
          <p>&copy; {new Date().getFullYear()} Sentinel Society Management System</p>
          <p>Built with the MERN stack</p>
        </div>
      </footer>
    </div>
  );
}
