import { ADVOCATE_DASHBOARD } from "@/lib/content";
import { Stat } from "@/components/common/Stat";
import { AdvocateLeads } from "@/components/advocate/AdvocateLeads";

export function AdvocateDashboard() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {ADVOCATE_DASHBOARD.stats.map(([title, value]) => <Stat key={title} title={title} value={value} />)}
      </div>
      <AdvocateLeads />
    </div>
  );
}
