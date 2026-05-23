export function CaseCard({ title, status }: { title: string; status: string }) {
  return (
    <div className="mb-3 rounded-3xl border bg-white p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{status}</p>
    </div>
  );
}
