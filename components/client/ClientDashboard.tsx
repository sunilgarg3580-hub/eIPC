"use client";

import React, { useEffect, useState } from "react";
import { getClientCases } from "@/lib/caseService";
import { getCurrentUser } from "@/lib/session";
import { Stat } from "@/components/common/Stat";
import { Panel } from "@/components/common/Panel";
import { getUnreadHumanMessagesForClient } from "@/lib/caseMessageService";

type CaseRecord = {
  id: string;
  title: string;
  case_type: string;
  city: string;
  status: string;
  facts: string;
  cnr_number: string | null;
  court_name: string | null;
  next_hearing_date: string | null;
  created_at: string;
};

export function ClientDashboard({
  setActiveTab,
}: {
  setActiveTab?: (tab: string) => void;
}) {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  async function loadDashboard() {
    try {
      setLoading(true);

      const session = await getCurrentUser();
      if (!session?.user?.id) return;

      const data = await getClientCases(session.user.id);
      setCases(data);

      const unread = await getUnreadHumanMessagesForClient(session.user.id);
      setUnreadMessages(unread.length);
    } catch (err) {
      console.error("CLIENT_DASHBOARD_ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const upcomingDates = cases.filter((c) => c.next_hearing_date).length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          title="Active cases"
          value={String(cases.length)}
          onClick={() => setActiveTab?.("cases")}
        />

        <Stat
          title="Unread messages"
          value={String(unreadMessages)}
          onClick={() => setActiveTab?.("messages")}
        />

        <Stat
          title="Drafts pending"
          value="0"
          onClick={() => setActiveTab?.("drafts")}
        />

        <Stat
          title="Upcoming dates"
          value={String(upcomingDates)}
          onClick={() => setActiveTab?.("tracker")}
        />
      </div>

      <Panel title="Recent Case Files">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
            Loading dashboard...
          </div>
        ) : cases.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
            No case files found. Create your first case file from My Case Files.
          </div>
        ) : (
          <div className="grid gap-3">
            {cases.slice(0, 5).map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveTab?.("cases")}
                className="rounded-3xl border bg-white p-5 text-left hover:bg-slate-50"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-400">{c.id}</div>
                    <h3 className="mt-1 text-lg font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {c.case_type} • {c.city}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {c.status}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                  {c.facts}
                </p>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}