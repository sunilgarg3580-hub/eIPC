import { ADVOCATE_PROFILE } from "@/lib/content";
import { Panel } from "@/components/common/Panel";
import { Input } from "@/components/common/Input";

export function AdvocateProfile() {
  return (
    <Panel title={ADVOCATE_PROFILE.title}>
      <div className="grid gap-3 md:grid-cols-2">
        {ADVOCATE_PROFILE.fields.map((field) => <Input key={field} label={field} />)}
      </div>
      <button className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
        {ADVOCATE_PROFILE.button}
      </button>
    </Panel>
  );
}
