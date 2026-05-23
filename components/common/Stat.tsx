export function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
