import { COURT_TRACKER } from "@/lib/content";
import { Panel } from "@/components/common/Panel";
import { Input } from "@/components/common/Input";

export function CourtTracker() {
  return (
    <Panel title={COURT_TRACKER.title}>
      <div className="grid gap-3 md:grid-cols-2">
        {COURT_TRACKER.fields.map((field) => <Input key={field} label={field} />)}
      </div>
      <button className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">{COURT_TRACKER.button}</button>
    </Panel>
  );
}
