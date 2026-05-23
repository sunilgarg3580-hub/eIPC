import { FIND_ADVOCATE } from "@/lib/content";
import { Panel } from "@/components/common/Panel";

export function FindAdvocate() {
  return (
    <Panel title={FIND_ADVOCATE.title}>
      <div className="grid gap-4 md:grid-cols-3">
        {FIND_ADVOCATE.cards.map(([title, description]) => (
          <div key={title} className="rounded-3xl border p-5">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
            <button className="mt-4 w-full rounded-2xl border px-4 py-3 text-sm font-semibold">{FIND_ADVOCATE.button}</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
