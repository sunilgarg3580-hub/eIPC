"use client";

import React, { useEffect, useState } from "react";
import { getClientCases } from "@/lib/caseService";
import {
  getCaseHumanMessages,
  markCaseMessagesRead,
  sendCaseHumanMessage,
} from "@/lib/caseMessageService";
import { getCurrentUser } from "@/lib/session";

export function ClientMessages() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadCases() {
    try {
      setLoading(true);

      const session = await getCurrentUser();
      if (!session?.user?.id) return;

      setClientId(session.user.id);

      const data = await getClientCases(session.user.id);
      setCases(data);

      if (data.length > 0) {
        await openCase(data[0]);
      }
    } catch (err: any) {
      alert(err.message || "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }

  async function openCase(caseItem: any) {
    try {
      setSelectedCase(caseItem);

      const data = await getCaseHumanMessages(caseItem.id);
      setMessages(data);

      await markCaseMessagesRead(caseItem.id, "client");
    } catch (err: any) {
      alert(err.message || "Unable to open messages.");
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  async function sendMessage() {
    try {
      if (!selectedCase || !clientId || !input.trim()) return;

      setSending(true);

      await sendCaseHumanMessage({
        caseId: selectedCase.id,
        senderId: clientId,
        role: "client",
        message: input,
      });

      setInput("");

      const updated = await getCaseHumanMessages(selectedCase.id);
      setMessages(updated);
    } catch (err: any) {
      alert(err.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  function getMessageLabel(role: string) {
    if (role === "advocate") return "Advocate";
    if (role === "system") return "System";
    return "Client";
  }

  function getMessageStyle(role: string) {
    if (role === "client") return "bg-slate-950 text-white";
    if (role === "advocate") return "bg-blue-50 text-blue-950 border border-blue-100";
    return "bg-white text-slate-800 border";
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Client Messages</h2>
        <p className="mt-1 text-sm text-slate-500">
          Communicate with the advocate assigned to your case.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          Loading messages...
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">
          Please create a case file first.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
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
            <div className="rounded-3xl border p-5">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{selectedCase.title}</h3>
                <p className="text-sm text-slate-500">
                  {selectedCase.case_type} • {selectedCase.city}
                </p>
              </div>

              {selectedCase.status !== "advocate_assigned" ? (
                <div className="rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                  Advocate messaging will be available after you approve an advocate
                  for this case.
                </div>
              ) : (
                <>
                  <div className="h-[460px] overflow-y-auto rounded-2xl bg-slate-50 p-4">
                    {messages.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        No messages yet. Start the conversation with your advocate.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={`rounded-2xl p-4 text-sm leading-6 ${getMessageStyle(
                              m.role
                            )}`}
                          >
                            <div className="mb-1 text-xs font-semibold opacity-60">
                              {getMessageLabel(m.role)}
                            </div>
                            <div className="whitespace-pre-wrap">{m.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="min-h-[70px] flex-1 rounded-2xl border p-3 text-sm"
                      placeholder="Message your advocate..."
                    />

                    <button
                      onClick={sendMessage}
                      disabled={sending}
                      className="rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}