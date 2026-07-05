import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-dark/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className={`relative w-full ${width} bg-surface rounded-xl shadow-xl border border-border animate-fade-in max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface rounded-t-xl">
          <h3 className="font-display text-lg text-navy-dark">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-soft hover:bg-paper hover:text-ink transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
