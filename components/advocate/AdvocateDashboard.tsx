"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import { getAdvocateDashboardStats } from "@/lib/leadService";
import { getUnreadMessagesForAdvocate } from "@/lib/messageService";
import { AdvocateLeads } from "./AdvocateLeads";

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

export function AdvocateDashboard() {
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
        getUnreadMessagesForAdvocate(session.user.id),
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

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="New leads" value={String(stats.newLeads)} />
        <Stat
          title="Unread client messages"
          value={String(stats.clientMessages)}
        />
        <Stat title="Review requests" value={String(stats.reviewRequests)} />
        <Stat title="Active clients" value={String(stats.activeClients)} />
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