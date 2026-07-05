import { useState } from 'react';
import { Menu, LogOut, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabel = {
  admin: 'Administrator',
  resident: 'Resident',
  security: 'Security Staff',
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const copyCode = async () => {
    if (!user?.society?.code) return;
    try {
      await navigator.clipboard.writeText(user.society.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-8 py-3.5">
        <button className="lg:hidden text-ink-soft" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>

        <div className="hidden lg:flex items-center gap-3">
          <p className="text-sm text-ink-soft">
            Welcome back, <span className="text-ink font-medium">{user?.name?.split(' ')[0]}</span>
          </p>
          {user?.society?.name && (
            <>
              <span className="text-border">·</span>
              <span className="text-sm text-ink-soft">{user.society.name}</span>
              {user.role === 'admin' && user.society.code && (
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 bg-amber-soft text-amber-dark text-xs font-semibold pl-2.5 pr-2 py-1 rounded-full hover:opacity-80 transition-opacity"
                  title="Copy join code to share with residents"
                >
                  {user.society.code}
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:border-navy/30 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-semibold">
              {user?.name?.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-ink leading-tight">{user?.name}</p>
              <p className="text-[10px] text-ink-soft leading-tight">{roleLabel[user?.role]}</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full text-ink-soft hover:bg-danger-soft hover:text-danger transition-colors"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
