import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Building2, Megaphone, MessageSquareWarning,
  UserCheck, Receipt, CalendarClock, X, ShieldCheck, Copy, Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navByRole = {
  admin: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/residents', label: 'Residents', icon: Users },
    { to: '/dashboard/flats', label: 'Flats & Blocks', icon: Building2 },
    { to: '/dashboard/notices', label: 'Notices', icon: Megaphone },
    { to: '/dashboard/complaints', label: 'Complaints', icon: MessageSquareWarning },
    { to: '/dashboard/visitors', label: 'Visitor Log', icon: UserCheck },
    { to: '/dashboard/payments', label: 'Maintenance Billing', icon: Receipt },
    { to: '/dashboard/amenities', label: 'Amenities & Bookings', icon: CalendarClock },
  ],
  resident: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/notices', label: 'Notices', icon: Megaphone },
    { to: '/dashboard/complaints', label: 'My Complaints', icon: MessageSquareWarning },
    { to: '/dashboard/payments', label: 'My Payments', icon: Receipt },
    { to: '/dashboard/amenities', label: 'Amenities & Bookings', icon: CalendarClock },
  ],
  security: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/visitors', label: 'Visitor Log', icon: UserCheck },
    { to: '/dashboard/notices', label: 'Notices', icon: Megaphone },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = navByRole[user?.role] || [];
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!user?.society?.code) return;
    navigator.clipboard.writeText(user.society.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-navy-dark/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-navy-dark text-white z-40 flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-amber flex items-center justify-center text-navy-dark">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-display text-lg leading-none">Sentinel</p>
              <p className="text-[10px] tracking-widest text-white/50 uppercase">Society OS</p>
            </div>
          </div>
          <button className="lg:hidden text-white/60" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white font-medium border-l-2 border-amber'
                    : 'text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          {user?.society?.name ? (
            <>
              <p className="text-xs text-white/70 font-medium truncate">{user.society.name}</p>
              {user.role === 'admin' && user.society.code && (
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 mt-1 text-[10px] text-white/40 hover:text-white/70 transition-colors group"
                  title="Copy join code"
                >
                  Join code: <span className="text-amber font-mono tracking-wider">{user.society.code}</span>
                  {copied ? <Check size={11} className="text-success" /> : <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              )}
            </>
          ) : (
            <p className="text-[11px] text-white/40">Sentinel Society OS v1.0</p>
          )}
        </div>
      </aside>
    </>
  );
}
