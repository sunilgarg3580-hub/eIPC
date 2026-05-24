"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import { getClientCases } from "@/lib/caseService";
import {
  formatCaseContextForPrompt,
  getFullCaseContext,
} from "@/lib/caseContextService";
import { createCaseAnalysis, getCaseAnalysis } from "@/lib/analysisService";

type CaseRecord = {
  id: string;
  title: string;
  case_type: string;
  city: string;
  facts: string;
};

type AnalysisRecord = {
  id: string;
  analysis_type: string;
  content: string;
  created_at: string;
};

const analysisTypes = [
  "Evidence Summary",
  "Case Chronology",
  "Strengths and Weaknesses",
  "Missing Documents Checklist",
  "Advocate Case Brief",
  "Next Action Plan",
];

export function CaseAnalysis() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [userId, setUserId] = useState("");
  const [analysisType, setAnalysisType] = useState("Evidence Summary");
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [extraInstructions, setExtraInstructions] = useState("");

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

  async function loadAnalyses(caseId: string) {
    if (!caseId) return;

    try {
      const data = await getCaseAnalysis(caseId);
      setAnalyses(data);
    } catch (err: any) {
      alert(err.message || "Unable to load analysis.");
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadAnalyses(selectedCaseId);
    }
  }, [selectedCaseId]);

  async function generateAnalysis() {
    try {
      if (!selectedCaseId || !userId) {
        alert("Please select a case.");
        return;
      }

      setGenerating(true);

      const context = await getFullCaseContext(selectedCaseId, userId);
      const formattedContext = formatCaseContextForPrompt(context);

      const promptMessage = `
Prepare ${analysisType} using the full case context below.

FULL CASE CONTEXT:
${formattedContext}

ADDITIONAL USER INSTRUCTIONS:
${extraInstructions || "No additional instructions."}

OUTPUT REQUIREMENTS:
- Be practical and advocate-ready.
- Do not invent facts.
- Clearly separate known facts from assumptions.
- Mention missing information.
- Use Indian legal context.
- Avoid guaranteeing legal outcome.

If analysis type is Evidence Summary:
- List each evidence item.
- Explain what it supports.
- Mention whether it appears strong, moderate or weak based on available description.

If analysis type is Case Chronology:
- Create date-wise / event-wise timeline.
- If dates are missing, use placeholders like [Date not provided].
- Mention source of each event if available.

If analysis type is Strengths and Weaknesses:
- Give strengths, weaknesses, risks, practical issues and suggested mitigation.

If analysis type is Missing Documents Checklist:
- Provide required, optional and helpful documents.

If analysis type is Advocate Case Brief:
- Prepare a concise brief that can be sent to an advocate.

If analysis type is Next Action Plan:
- Give step-by-step action plan with priority.
`;

      const res = await fetch("/api/legal-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: `prepare ${analysisType}`,
          caseId: selectedCaseId,
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
        `Unable to generate ${analysisType}. Please add more case details and try again.`;

      await createCaseAnalysis({
        caseId: selectedCaseId,
        createdBy: userId,
        analysisType,
        content,
      });

      await loadAnalyses(selectedCaseId);

      alert(`${analysisType} generated successfully.`);
    } catch (err: any) {
      alert(err.message || "Unable to generate case analysis.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">AI Case Analysis</h2>
        <p className="mt-1 text-sm text-slate-500">
          Generate evidence summaries, chronology, strengths, weaknesses and advocate-ready briefs.
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
                className="rounded-2xl border bg-white p-3 text-sm"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {c.case_type}
                  </option>
                ))}
              </select>

              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="rounded-2xl border bg-white p-3 text-sm"
              >
                {analysisTypes.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>

              <button
                onClick={generateAnalysis}
                disabled={generating}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Analysis"}
              </button>
            </div>

            <textarea
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              className="mt-4 w-full rounded-2xl border bg-white p-3 text-sm"
              rows={4}
              placeholder="Optional: Add focus area, e.g. identify weak evidence, prepare chronology for rent dispute, summarize for advocate..."
            />
          </div>

          <div className="mt-6 grid gap-4">
            {analyses.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                No analysis generated for this case yet.
              </div>
            ) : (
              analyses.map((a) => (
                <div key={a.id} className="rounded-3xl border bg-white p-5">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400">
                        {a.analysis_type} •{" "}
                        {new Date(a.created_at).toLocaleDateString()}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold">
                        {a.analysis_type}
                      </h3>
                    </div>
                  </div>

                  <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {a.content}
                  </pre>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}