import { ADVOCATE_CASES } from "@/lib/content";
import { Panel } from "@/components/common/Panel";
import { CaseCard } from "@/components/common/CaseCard";

export function AdvocateCases() {
  return (
    <Panel title={ADVOCATE_CASES.title}>
      {ADVOCATE_CASES.cases.map(([title, status]) => <CaseCard key={title} title={title} status={status} />)}
    </Panel>
  );
}
