export function Stat({
  title,
  value,
  onClick,
}: {
  title: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl bg-white p-5 text-left shadow transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
    >
      <div className="text-sm font-medium text-slate-500">{title}</div>

      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </div>
    </button>
  );
}