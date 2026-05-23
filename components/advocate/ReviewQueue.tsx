import { REVIEW_QUEUE } from "@/lib/content";
import { Panel } from "@/components/common/Panel";
import { CaseCard } from "@/components/common/CaseCard";

export function ReviewQueue() {
  return (
    <Panel title={REVIEW_QUEUE.title}>
      {REVIEW_QUEUE.items.map(([title, status]) => <CaseCard key={title} title={title} status={status} />)}
    </Panel>
  );
}
