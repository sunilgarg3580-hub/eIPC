import { ADVOCATE_LEADS } from "@/lib/content";

export function LeadCard({ name, matter, city }: { name: string; matter: string; city: string }) {
  return (
    <div className="mb-3 rounded-3xl border bg-white p-5">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-slate-500">{matter}</p>
      <p className="mt-1 text-sm text-slate-500">City: {city}</p>
      <div className="mt-4 flex gap-3">
        <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          {ADVOCATE_LEADS.viewButton}
        </button>
        <button className="rounded-2xl border px-5 py-3 text-sm font-semibold">
          {ADVOCATE_LEADS.replyButton}
        </button>
      </div>
    </div>
  );
}
