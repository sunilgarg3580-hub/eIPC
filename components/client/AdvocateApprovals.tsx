"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import {
  clientAcceptAdvocate,
  clientRejectAdvocate,
  getPendingClientApprovalLeads,
} from "@/lib/leadService";

export function AdvocateApprovals() {
  const [leads, setLeads] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");

  async function loadPending() {
    try {
      setLoading(true);

      const session = await getCurrentUser();
      if (!session?.user?.id) return;

      setClientId(session.user.id);

      const data = await getPendingClientApprovalLeads(session.user.id);
      setLeads(data);
    } catch (err: any) {
      alert(err.message || "Unable to load advocate approvals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function acceptAdvocate(lead: any) {
    try {
      setProcessingId(lead.id);

      await clientAcceptAdvocate({
        leadId: lead.id,
        clientId,
        caseId: lead.case_id,
        advocateId: lead.advocate_id,
      });

      await loadPending();

      alert("Advocate confirmed. Launch offer token amount ₹0 applied.");
    } catch (err: any) {
      alert(err.message || "Unable to accept advocate.");
    } finally {
      setProcessingId("");
    }
  }

  async function rejectAdvocate(lead: any) {
    try {
      const reason = prompt("Reason for rejection?") || "";

      setProcessingId(lead.id);

      await clientRejectAdvocate({
        leadId: lead.id,
        clientId,
        caseId: lead.case_id,
        advocateId: lead.advocate_id,
        reason,
      });

      await loadPending();

      alert("Advocate rejected. Case reopened for other advocates.");
    } catch (err: any) {
      alert(err.message || "Unable to reject advocate.");
    } finally {
      setProcessingId("");
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold">Advocate Approvals</h2>
      <p className="mt-1 text-sm text-slate-500">
        Review advocates who unlocked your case. Launch offer: client token amount ₹0.
      </p>

      {loading ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          Loading approvals...
        </div>
      ) : leads.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          No advocate approvals pending.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-3xl border p-5">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {lead.advocateProfile?.full_name || "Advocate"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {lead.advocateDetails?.practice_city || "City not available"} •{" "}
                    {lead.advocateDetails?.years_of_experience || 0} years experience
                  </p>
                </div>

                <span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Launch Offer ₹0
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6">
                <div><b>Case:</b> {lead.cases?.title}</div>
                <div><b>Practice Areas:</b> {(lead.advocateDetails?.practice_areas || []).join(", ")}</div>
                <div><b>Bar No:</b> {lead.advocateDetails?.bar_registration_number || "Not available"}</div>
                <div><b>Profile:</b> {lead.advocateDetails?.profile_summary || "Not available"}</div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => acceptAdvocate(lead)}
                  disabled={processingId === lead.id}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Accept Advocate - ₹0
                </button>

                <button
                  onClick={() => rejectAdvocate(lead)}
                  disabled={processingId === lead.id}
                  className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 disabled:opacity-50"
                >
                  Reject Advocate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}