"use client";

import React, { useEffect, useState } from "react";
import { getAcceptedAdvocateCases } from "@/lib/leadService";
import { getCurrentUser } from "@/lib/session";
import {
  getCaseMessages,
  markAdvocateMessagesRead,
  sendCaseMessage,
} from "@/lib/messageService";
import { getEvidenceFiles, getEvidenceSignedUrl } from "@/lib/evidenceService";
import { getCaseDrafts } from "@/lib/draftService";

export function AdvocateCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [advocateId, setAdvocateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadCases() {
    try {
      setLoading(true);

      const session = await getCurrentUser();
      if (!session?.user?.id) return;

      setAdvocateId(session.user.id);

      const data = await getAcceptedAdvocateCases(session.user.id);
      setCases(data);

      if (data.length > 0) {
        await openCase(data[0]);
      }
    } catch (err: any) {
      alert(err.message || "Unable to load advocate cases.");
    } finally {
      setLoading(false);
    }
  }

  async function openCase(caseItem: any) {
    try {
      setSelectedCase(caseItem);

      const [caseMessages, caseEvidence, caseDrafts] = await Promise.all([
        getCaseMessages(caseItem.id),
        getEvidenceFiles(caseItem.id),
        getCaseDrafts(caseItem.id),
      ]);

      setMessages(caseMessages);
      setEvidence(caseEvidence);
      setDrafts(caseDrafts);

      await markAdvocateMessagesRead(caseItem.id);
    } catch (err: any) {
      alert(err.message || "Unable to open case.");
    }
  }

  async function refreshMessages() {
    if (!selectedCase?.id) return;

    const updated = await getCaseMessages(selectedCase.id);
    setMessages(updated);
  }

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (!selectedCase?.id) return;

    const interval = setInterval(() => {
      refreshMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedCase]);

  async function sendMessage() {
    try {
      if (!input.trim() || !selectedCase || !advocateId) return;

      setSending(true);

      await sendCaseMessage({
        caseId: selectedCase.id,
        userId: advocateId,
        role: "advocate",
        message: input,
      });

      setInput("");
      await refreshMessages();
    } catch (err: any) {
      alert(err.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  async function openEvidence(filePath: string) {
    try {
      const url = await getEvidenceSignedUrl(filePath);
      window.open(url, "_blank");
    } catch (err: any) {
      alert(err.message || "Unable to open evidence.");
    }
  }

  function getMessageLabel(role: string) {
    if (role === "advocate") return "Advocate";
    if (role === "assistant") return "eIPC AI";
    return "Client";
  }

  function getMessageStyle(role: string) {
    if (role === "advocate") return "bg-slate-950 text-white";
    if (role === "assistant") return "bg-white text-slate-800 border";
    return "bg-blue-50 text-blue-950 border border-blue-100";
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <h2 className="mb-5 text-2xl font-bold">Client Cases</h2>

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          Loading cases...
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          No accepted cases yet. Accept a lead first.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => openCase(c)}
                className={`w-full rounded-2xl border p-4 text-left text-sm ${
                  selectedCase?.id === c.id
                    ? "bg-slate-950 text-white"
                    : "bg-white"
                }`}
              >
                <div className="font-semibold">{c.title}</div>
                <div className="mt-1 opacity-70">{c.case_type}</div>
                <div className="mt-2 text-xs opacity-60">{c.status}</div>
              </button>
            ))}
          </div>

          {selectedCase && (
            <div className="grid gap-5">
              <div className="rounded-3xl border p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedCase.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedCase.case_type} • {selectedCase.city}
                    </p>
                  </div>

                  <span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {selectedCase.status}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {selectedCase.facts}
                </p>
              </div>

              <div className="rounded-3xl border p-5">
                <h3 className="mb-3 text-lg font-semibold">Drafts</h3>

                {drafts.length === 0 ? (
                  <p className="text-sm text-slate-500">No drafts available.</p>
                ) : (
                  drafts.map((d) => (
                    <div
                      key={d.id}
                      className="mb-3 rounded-2xl bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <div className="text-xs text-slate-400">
                            {d.draft_type}
                          </div>
                          <div className="font-semibold">{d.title}</div>
                        </div>

                        <span className="h-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {d.status}
                        </span>
                      </div>

                      <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-3 text-sm leading-6">
                        {d.content}
                      </pre>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-3xl border p-5">
                <h3 className="mb-3 text-lg font-semibold">Evidence</h3>

                {evidence.length === 0 ? (
                  <p className="text-sm text-slate-500">No evidence uploaded.</p>
                ) : (
                  evidence.map((f) => (
                    <div
                      key={f.id}
                      className="mb-2 flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                    >
                      <div>
                        <div className="font-medium">{f.file_name}</div>
                        <div className="text-xs text-slate-500">
                          {f.notes || "No notes"}
                        </div>
                      </div>

                      <button
                        onClick={() => openEvidence(f.file_url)}
                        className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold"
                      >
                        View
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-3xl border p-5">
                <h3 className="mb-3 text-lg font-semibold">
                  Client Conversation
                </h3>

                <div className="h-72 overflow-y-auto rounded-2xl bg-slate-50 p-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-slate-500">No messages yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`rounded-2xl p-3 text-sm ${getMessageStyle(
                            m.role
                          )}`}
                        >
                          <div className="mb-1 text-xs font-semibold opacity-60">
                            {getMessageLabel(m.role)}
                          </div>

                          <div className="whitespace-pre-wrap leading-6">
                            {m.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[70px] flex-1 rounded-2xl border p-3 text-sm"
                    placeholder="Reply to client..."
                  />

                  <button
                    onClick={sendMessage}
                    disabled={sending}
                    className="rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}