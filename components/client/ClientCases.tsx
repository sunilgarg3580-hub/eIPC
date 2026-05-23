"use client";

import React, { useEffect, useState } from "react";
import { createCase, getClientCases } from "@/lib/caseService";
import { getCurrentUser } from "@/lib/session";
import { getCaseParties, upsertOppositeParty } from "@/lib/casePartyService";
import { getEvidenceFiles, getEvidenceSignedUrl } from "@/lib/evidenceService";

type CaseRecord = {
  id: string;
  title: string;
  case_type: string;
  city: string;
  status: string;
  facts: string;
  cnr_number: string | null;
  court_name: string | null;
  created_at: string;
};

type EvidenceRecord = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  notes: string | null;
  created_at: string;
};

export function ClientCases() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartyCaseId, setEditingPartyCaseId] = useState("");
  const [caseEvidence, setCaseEvidence] = useState<
    Record<string, EvidenceRecord[]>
  >({});

  const [form, setForm] = useState({
    title: "",
    caseType: "",
    city: "",
    facts: "",
    cnrNumber: "",
    courtName: "",
  });

  const [partyForm, setPartyForm] = useState({
    name: "",
    fatherName: "",
    address: "",
    mobile: "",
    email: "",
    roleDescription: "",
  });

  async function loadEvidenceForCases(caseList: CaseRecord[]) {
    const evidenceMap: Record<string, EvidenceRecord[]> = {};

    for (const c of caseList) {
      const files = await getEvidenceFiles(c.id);
      evidenceMap[c.id] = files;
    }

    setCaseEvidence(evidenceMap);
  }

  async function openEvidence(filePath: string) {
    try {
      const url = await getEvidenceSignedUrl(filePath);
      window.open(url, "_blank");
    } catch (err: any) {
      alert(err.message || "Unable to open evidence file.");
    }
  }

  async function loadCases() {
    try {
      setLoading(true);
      const session = await getCurrentUser();

      if (!session?.user?.id) {
        alert("Please login again.");
        return;
      }

      const data = await getClientCases(session.user.id);
      setCases(data);
      await loadEvidenceForCases(data);
    } catch (err: any) {
      alert(err.message || "Unable to load cases.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updatePartyField(key: string, value: string) {
    setPartyForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreateCase() {
    try {
      const session = await getCurrentUser();

      if (!session?.user?.id) {
        alert("Please login again.");
        return;
      }

      if (!form.title || !form.caseType || !form.city || !form.facts) {
        alert("Please fill title, case type, city and facts.");
        return;
      }

      await createCase({
        clientId: session.user.id,
        title: form.title,
        caseType: form.caseType,
        city: form.city,
        facts: form.facts,
        cnrNumber: form.cnrNumber,
        courtName: form.courtName,
      });

      setForm({
        title: "",
        caseType: "",
        city: "",
        facts: "",
        cnrNumber: "",
        courtName: "",
      });

      setShowForm(false);
      await loadCases();

      alert("Case file created successfully.");
    } catch (err: any) {
      alert(err.message || "Unable to create case file.");
    }
  }

  async function openPartyEditor(caseId: string) {
    try {
      setEditingPartyCaseId(caseId);

      const parties = await getCaseParties(caseId);
      const oppositeParty = parties.find(
        (p: any) => p.party_type === "opposite_party"
      );

      if (oppositeParty) {
        setPartyForm({
          name: oppositeParty.name || "",
          fatherName: oppositeParty.father_name || "",
          address: oppositeParty.address || "",
          mobile: oppositeParty.mobile || "",
          email: oppositeParty.email || "",
          roleDescription: oppositeParty.role_description || "",
        });
      } else {
        setPartyForm({
          name: "",
          fatherName: "",
          address: "",
          mobile: "",
          email: "",
          roleDescription: "",
        });
      }
    } catch (err: any) {
      alert(err.message || "Unable to load opposite party details.");
    }
  }

  async function saveOppositeParty() {
    try {
      if (!editingPartyCaseId) return;

      if (!partyForm.name) {
        alert("Please enter opposite party name.");
        return;
      }

      await upsertOppositeParty({
        caseId: editingPartyCaseId,
        name: partyForm.name,
        fatherName: partyForm.fatherName,
        address: partyForm.address,
        mobile: partyForm.mobile,
        email: partyForm.email,
        roleDescription: partyForm.roleDescription,
      });

      setEditingPartyCaseId("");
      alert("Opposite party details saved.");
    } catch (err: any) {
      alert(err.message || "Unable to save opposite party details.");
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Case Files</h2>
          <p className="text-sm text-slate-500">
            Create case files, maintain parties and view evidence documents.
          </p>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          + Create New Case File
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-3xl border bg-slate-50 p-5">
          <h3 className="mb-4 text-lg font-semibold">New Case File</h3>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-2xl border p-3 text-sm"
              placeholder="Case title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />

            <input
              className="rounded-2xl border p-3 text-sm"
              placeholder="Case type e.g. Money Recovery, Rent, Divorce"
              value={form.caseType}
              onChange={(e) => updateField("caseType", e.target.value)}
            />

            <input
              className="rounded-2xl border p-3 text-sm"
              placeholder="City / State"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
            />

            <input
              className="rounded-2xl border p-3 text-sm"
              placeholder="CNR number, if existing court case"
              value={form.cnrNumber}
              onChange={(e) => updateField("cnrNumber", e.target.value)}
            />

            <input
              className="rounded-2xl border p-3 text-sm md:col-span-2"
              placeholder="Court name, if applicable"
              value={form.courtName}
              onChange={(e) => updateField("courtName", e.target.value)}
            />

            <textarea
              className="rounded-2xl border p-3 text-sm md:col-span-2"
              rows={5}
              placeholder="Explain complete facts of the case"
              value={form.facts}
              onChange={(e) => updateField("facts", e.target.value)}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCreateCase}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Save Case File
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="rounded-2xl border px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingPartyCaseId && (
        <div className="mb-6 rounded-3xl border bg-blue-50 p-5">
          <h3 className="mb-4 text-lg font-semibold">
            Opposite Party Details
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-2xl border p-3 text-sm"
              placeholder="Opposite party name"
              value={partyForm.name}
              onChange={(e) => updatePartyField("name", e.target.value)}
            />

            <input
              className="rounded-2xl border p-3 text-sm"
              placeholder="Father / Spouse name"
              value={partyForm.fatherName}
              onChange={(e) => updatePartyField("fatherName", e.target.value)}
            />

            <input
              className="rounded-2xl border p-3 text-sm"
              placeholder="Mobile"
              value={partyForm.mobile}
              onChange={(e) => updatePartyField("mobile", e.target.value)}
            />

            <input
              className="rounded-2xl border p-3 text-sm"
              placeholder="Email"
              value={partyForm.email}
              onChange={(e) => updatePartyField("email", e.target.value)}
            />

            <input
              className="rounded-2xl border p-3 text-sm md:col-span-2"
              placeholder="Role / relationship e.g. tenant, borrower, spouse, vendor"
              value={partyForm.roleDescription}
              onChange={(e) =>
                updatePartyField("roleDescription", e.target.value)
              }
            />

            <textarea
              className="rounded-2xl border p-3 text-sm md:col-span-2"
              rows={4}
              placeholder="Opposite party address"
              value={partyForm.address}
              onChange={(e) => updatePartyField("address", e.target.value)}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={saveOppositeParty}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Save Opposite Party
            </button>

            <button
              onClick={() => setEditingPartyCaseId("")}
              className="rounded-2xl border px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          Loading cases...
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          No case files created yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((c) => (
            <div key={c.id} className="rounded-3xl border bg-white p-5">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">{c.id}</div>
                  <h3 className="mt-1 text-xl font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {c.case_type} • {c.city}
                  </p>
                </div>

                <span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {c.status}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {c.facts}
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <MiniBox title="CNR" value={c.cnr_number || "Not added"} />
                <MiniBox title="Court" value={c.court_name || "Not added"} />
                <MiniBox
                  title="Created"
                  value={new Date(c.created_at).toLocaleDateString()}
                />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold">Evidence / Documents</h4>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                    {(caseEvidence[c.id] || []).length} files
                  </span>
                </div>

                {(caseEvidence[c.id] || []).length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No evidence uploaded yet.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {(caseEvidence[c.id] || []).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-xl bg-white p-3 text-sm"
                      >
                        <div>
                          <div className="font-medium">{file.file_name}</div>
                          <div className="text-xs text-slate-500">
                            {file.notes || "No notes"}
                          </div>
                        </div>

                        <button
                          onClick={() => openEvidence(file.file_url)}
                          className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => openPartyEditor(c.id)}
                className="mt-4 rounded-2xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Add / Edit Opposite Party
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MiniBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs text-slate-400">{title}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}