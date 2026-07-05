export default function Loader({ full }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-navy/20 border-t-navy animate-spin" />
      <span className="label-eyebrow">Loading</span>
    </div>
  );

  if (full) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-paper">
        {spinner}
      </div>
    );
  }

  return <div className="w-full flex items-center justify-center py-16">{spinner}</div>;
}
