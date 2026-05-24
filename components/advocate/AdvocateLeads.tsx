"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import { getAllOpenLeads, unlockLeadFree } from "@/lib/leadService";

export function AdvocateLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockingId, setUnlockingId] = useState("");

  async function loadLeads() {
    try {
      setLoading(true);

      const session = await getCurrentUser();

      if (!session?.user?.id) {
        alert("Please login again.");
        return;
      }

      const data = await getAllOpenLeads(session.user.id);
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

  async function handleUnlockLead(lead: any) {
    try {
      const session = await getCurrentUser();

      if (!session?.user?.id) {
        alert("Please login again.");
        return;
      }

      setUnlockingId(lead.id);

      await unlockLeadFree({
        leadId: lead.id,
        advocateId: session.user.id,
        caseId: lead.case_id,
      });

      await loadLeads();

      alert("Lead unlocked under launch offer. Waiting for client approval.");
    } catch (err: any) {
      alert(err.message || "Unable to unlock lead.");
    } finally {
      setUnlockingId("");
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">New Leads</h2>
        <p className="mt-1 text-sm text-slate-500">
          Launch offer: lead unlock is currently free. Client contact details are shown only after unlock.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          Loading leads...
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          No new leads available.
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
                    {lead.cases?.case_type || "Case type not available"} •{" "}
                    {lead.city || lead.cases?.city || "City not available"}
                  </p>
                </div>

                <span className="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {lead.urgency || "medium"}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-700">
                {lead.matter_summary}
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6">
                <div>
                  <b>Client:</b> Hidden until lead is unlocked
                </div>
                <div>
                  <b>Email:</b> Hidden until lead is unlocked
                </div>
                <div>
                  <b>Mobile:</b> Hidden until lead is unlocked
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Lead unlock fee: ₹0 under launch offer.
                </div>
              </div>

              <button
                onClick={() => handleUnlockLead(lead)}
                disabled={unlockingId === lead.id}
                className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {unlockingId === lead.id ? "Unlocking..." : "Unlock Lead - FREE"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}