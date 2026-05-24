"use client";

import React, { useEffect, useState } from "react";
import { acceptLead, getAllOpenLeads } from "@/lib/leadService";
import { getCurrentUser } from "@/lib/session";

export function AdvocateLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState("");

  async function loadLeads() {
    try {
      setLoading(true);
      const data = await getAllOpenLeads();
      setLeads(data);
    } catch (err: any) {
      alert(err.message || "Unable to load leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function handleAcceptLead(lead: any) {
    try {
      const session = await getCurrentUser();
      if (!session?.user?.id) {
        alert("Please login again.");
        return;
      }

      setAcceptingId(lead.id);

      await acceptLead({
        leadId: lead.id,
        advocateId: session.user.id,
        caseId: lead.case_id,
      });

      await loadLeads();
      alert("Lead accepted. Case moved to Client Cases.");
    } catch (err: any) {
      alert(err.message || "Unable to accept lead.");
    } finally {
      setAcceptingId("");
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <h2 className="mb-5 text-2xl font-bold">New Leads</h2>

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          Loading leads...
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          No new leads yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-3xl border bg-white p-5">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {lead.cases?.title || "Legal Matter"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {lead.cases?.case_type} • {lead.city}
                  </p>
                </div>

                <span className="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {lead.urgency}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-700">
                {lead.matter_summary}
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
                <div><b>Client:</b> {lead.profiles?.full_name || "Not available"}</div>
                <div><b>Email:</b> {lead.profiles?.email || "Not available"}</div>
                <div><b>Mobile:</b> {lead.profiles?.mobile || "Not available"}</div>
              </div>

              <button
                onClick={() => handleAcceptLead(lead)}
                disabled={acceptingId === lead.id}
                className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {acceptingId === lead.id ? "Accepting..." : "Accept Lead"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}