"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import { getAdvocateDashboardStats } from "@/lib/leadService";
import { AdvocateLeads } from "./AdvocateLeads";
import { getUnreadHumanMessagesForAdvocate } from "@/lib/caseMessageService";

function Stat({
  title,
  value,
  onClick,
}: {
  title: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl bg-white p-5 text-left shadow hover:bg-slate-50"
    >
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </button>
  );
}

export function AdvocateDashboard({
  setActiveTab,
}: {
  setActiveTab?: (tab: string) => void;
}) {
  const [stats, setStats] = useState({
    newLeads: 0,
    clientMessages: 0,
    reviewRequests: 0,
    activeClients: 0,
  });

  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const session = await getCurrentUser();
      if (!session?.user?.id) return;

      const [dashboardStats, unreadMessages] = await Promise.all([
        getAdvocateDashboardStats(session.user.id),
        getUnreadHumanMessagesForAdvocate(session.user.id),
      ]);

      setStats({
        ...dashboardStats,
        clientMessages: unreadMessages.length,
      });
    } catch (err) {
      console.error("ADVOCATE_DASHBOARD_ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          title="New leads"
          value={String(stats.newLeads)}
          onClick={() => setActiveTab?.("leads")}
        />

        <Stat
          title="Unread client messages"
          value={String(stats.clientMessages)}
          onClick={() => setActiveTab?.("messages")}
        />

        <Stat
          title="Review requests"
          value={String(stats.reviewRequests)}
          onClick={() => setActiveTab?.("cases")}
        />

        <Stat
          title="Active clients"
          value={String(stats.activeClients)}
          onClick={() => setActiveTab?.("cases")}
        />
      </div>

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          Loading dashboard...
        </div>
      ) : (
        <AdvocateLeads />
      )}
    </div>
  );
}