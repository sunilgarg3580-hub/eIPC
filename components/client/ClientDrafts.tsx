"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import { getClientCases } from "@/lib/caseService";
import {
  createDraft,
  getCaseDrafts,
  updateDraftContent,
} from "@/lib/draftService";
import {
  getFullCaseContext,
  formatCaseContextForPrompt,
} from "@/lib/caseContextService";
import { createAdvocateLead } from "@/lib/leadService";

type CaseRecord = {
  id: string;
  title: string;
  case_type: string;
  city: string;
  facts: string;
  cnr_number?: string | null;
  court_name?: string | null;
};

type DraftRecord = {
  id: string;
  draft_type: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
};

const draftTypes = [
  "Legal Notice",
  "Reply to Legal Notice",
  "Money Recovery Notice",
  "Cheque Bounce Notice",
  "Rent Eviction Notice",
  "Consumer Complaint",
  "Divorce Petition Outline",
  "Civil Suit / Plaint Outline",
  "Written Statement Outline",
  "Evidence Checklist",
  "Case Summary for Lawyer",
];

export function ClientDrafts() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [userId, setUserId] = useState("");
  const [draftType, setDraftType] = useState("Legal Notice");
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [extraInstructions, setExtraInstructions] = useState("");

  const [editingDraftId, setEditingDraftId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  async function loadCases() {
    try {
      setLoading(true);

      const session = await getCurrentUser();

      if (!session?.user?.id) {
        alert("Please login again.");
        return;
      }

      setUserId(session.user.id);

      const data = await getClientCases(session.user.id);
      setCases(data);

      if (data.length > 0) {
        setSelectedCaseId(data[0].id);
      }
    } catch (err: any) {
      alert(err.message || "Unable to load cases.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDrafts(caseId: string) {
    if (!caseId) return;

    try {
      const data = await getCaseDrafts(caseId);
      setDrafts(data);
    } catch (err: any) {
      alert(err.message || "Unable to load drafts.");
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadDrafts(selectedCaseId);
      cancelEditingDraft();
    }
  }, [selectedCaseId]);

  async function generateDraft() {
    try {
      if (!selectedCaseId || !userId) {
        alert("Please select a case.");
        return;
      }

      const selectedCase = cases.find((c) => c.id === selectedCaseId);

      if (!selectedCase) {
        alert("Selected case not found.");
        return;
      }

      setGenerating(true);

      const fullContext = await getFullCaseContext(selectedCase.id, userId);
      const formattedContext = formatCaseContextForPrompt(fullContext);

      const promptMessage = `
Prepare a complete ${draftType} using the full case context below.

FULL CASE CONTEXT:
${formattedContext}

ADDITIONAL USER INSTRUCTIONS:
${extraInstructions || "No additional instructions."}

IMPORTANT DRAFTING REQUIREMENTS:
- Generate the actual ${draftType}, not a summary or label.
- Use client profile details wherever available.
- Use opposite party details wherever available.
- Use uploaded evidence list as supporting facts.
- Use recent chat history only if relevant.
- Use formal Indian legal drafting language.
- Do not invent facts, dates, addresses, advocate names or citations.
- Add placeholders only where information is missing.
- Include proper legal structure depending on selected document type.
- Add final note that the draft should be reviewed by a licensed advocate before use.
`;

      const res = await fetch("/api/legal-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: `prepare actual ${draftType}`,
          caseFacts: selectedCase.facts,
          caseId: selectedCase.id,
          messages: [
            {
              role: "user",
              text: promptMessage,
            },
          ],
        }),
      });

      const data = await res.json();

      const content =
        data.reply ||
        `Unable to generate ${draftType}. Please add more facts and try again.`;

      await createDraft({
        caseId: selectedCaseId,
        createdBy: userId,
        draftType,
        title: `${draftType} - ${selectedCase.title}`,
        content,
      });

      await loadDrafts(selectedCaseId);

      alert(`${draftType} generated and saved successfully.`);
    } catch (err: any) {
      alert(err.message || "Unable to generate draft.");
    } finally {
      setGenerating(false);
    }
  }

  function startEditingDraft(draft: DraftRecord) {
    setEditingDraftId(draft.id);
    setEditTitle(draft.title);
    setEditContent(draft.content);
  }

  function cancelEditingDraft() {
    setEditingDraftId("");
    setEditTitle("");
    setEditContent("");
  }

  async function saveEditedDraft() {
    try {
      if (!editingDraftId) return;

      if (!editTitle.trim() || !editContent.trim()) {
        alert("Draft title and content cannot be empty.");
        return;
      }

      setSavingEdit(true);

      await updateDraftContent({
        draftId: editingDraftId,
        title: editTitle,
        content: editContent,
      });

      await loadDrafts(selectedCaseId);
      cancelEditingDraft();

      alert("Draft updated successfully.");
    } catch (err: any) {
      alert(err.message || "Unable to update draft.");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Drafts & Replies</h2>
        <p className="text-sm text-slate-500">
          Select a case and document type. eIPC will prepare the actual document
          using case facts.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          Loading cases...
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">
          Please create a case file first.
        </div>
      ) : (
        <>
          <div className="rounded-3xl border bg-slate-50 p-5">
            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="rounded-2xl border p-3 text-sm"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value)}
                className="rounded-2xl border p-3 text-sm"
              >
                {draftTypes.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>

              <button
                onClick={generateDraft}
                disabled={generating}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {generating
                  ? "Generating Document..."
                  : "Generate Selected Document"}
              </button>
            </div>

            <textarea
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              className="mt-4 w-full rounded-2xl border bg-white p-3 text-sm"
              rows={4}
              placeholder="Optional: Add extra instructions, e.g. claim 18% interest, make language strong but professional, include 15 days payment demand..."
            />
          </div>

          <div className="mt-6 grid gap-4">
            {drafts.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                No drafts saved for this case yet.
              </div>
            ) : (
              drafts.map((d) => (
                <div key={d.id} className="rounded-3xl border bg-white p-5">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400">
                        {d.draft_type} •{" "}
                        {new Date(d.created_at).toLocaleDateString()}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold">{d.title}</h3>
                    </div>

                    <span className="h-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {d.status}
                    </span>
                  </div>

                  {editingDraftId === d.id ? (
                    <div className="mt-4">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-2xl border p-3 text-sm font-semibold"
                        placeholder="Draft title"
                      />

                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="mt-3 min-h-[420px] w-full rounded-2xl border bg-white p-4 text-sm leading-6"
                        placeholder="Edit draft..."
                      />

                      <div className="mt-3 flex gap-3">
                        <button
                          onClick={saveEditedDraft}
                          disabled={savingEdit}
                          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {savingEdit ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          onClick={cancelEditingDraft}
                          className="rounded-2xl border px-5 py-3 text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <pre className="mt-4 max-h-[500px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        {d.content}
                      </pre>

                      <div className="mt-3 flex gap-3">
                        <button
                          onClick={() => startEditingDraft(d)}
                          className="rounded-2xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                        >
                          Edit Draft
                        </button>
                        <button
                          onClick={() => sendToAdvocateReview(d)}
                          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                        >
                          Send to Advocate
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
  async function sendToAdvocateReview(draft: DraftRecord) {
    try {
      const selectedCase = cases.find((c) => c.id === selectedCaseId);

      if (!selectedCase || !userId) {
        alert("Case or user not found.");
        return;
      }

      await createAdvocateLead({
        clientId: userId,
        caseId: selectedCaseId,
        matterSummary: `Client requested advocate review for ${draft.draft_type}: ${draft.title}`,
        city: selectedCase.city,
        urgency: "medium",
      });

      alert("Sent to advocate review queue.");
    } catch (err: any) {
      alert(err.message || "Unable to send to advocate.");
    }
  }
}