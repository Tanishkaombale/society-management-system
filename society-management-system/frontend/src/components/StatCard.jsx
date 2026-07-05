export default function StatCard({ label, value, icon: Icon, accent = 'navy', suffix }) {
  return (
    <div className={`ledger-card ${accent === 'amber' ? 'accent-amber' : ''} p-5 flex items-start justify-between`}>
      <div>
        <p className="label-eyebrow">{label}</p>
        <p className="stat-figure text-3xl text-navy-dark mt-2">
          {value}
          {suffix && <span className="text-base font-sans text-ink-soft ml-1">{suffix}</span>}
        </p>
      </div>
      {Icon && (
        <div className={`p-2.5 rounded-lg ${accent === 'amber' ? 'bg-amber-soft text-amber-dark' : 'bg-navy/5 text-navy'}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
