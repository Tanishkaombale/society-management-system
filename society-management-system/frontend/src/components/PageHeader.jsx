export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        {eyebrow && <p className="label-eyebrow mb-1">{eyebrow}</p>}
        <h1 className="font-display text-2xl md:text-3xl text-navy-dark">{title}</h1>
        {description && <p className="text-ink-soft text-sm mt-1 max-w-xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-border rounded-xl bg-surface">
      {Icon && (
        <div className="p-3 rounded-full bg-paper text-ink-soft mb-4">
          <Icon size={22} />
        </div>
      )}
      <p className="font-display text-lg text-navy-dark">{title}</p>
      {description && <p className="text-sm text-ink-soft mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
