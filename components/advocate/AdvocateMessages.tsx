import { ADVOCATE_MESSAGES } from "@/lib/content";
import { Panel } from "@/components/common/Panel";
import { CaseCard } from "@/components/common/CaseCard";

export function AdvocateMessages() {
  return (
    <Panel title={ADVOCATE_MESSAGES.title}>
      {ADVOCATE_MESSAGES.messages.map(([title, status]) => <CaseCard key={title} title={title} status={status} />)}
    </Panel>
  );
}
