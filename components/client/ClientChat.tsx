"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import { getClientCases } from "@/lib/caseService";
import { getCaseChatMessages, saveChatMessage } from "@/lib/chatService";

type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  message: string;
};

type CaseRecord = {
  id: string;
  title: string;
  case_type: string;
};

export function ClientChat() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);

  async function loadCases() {
    try {
      setLoadingCases(true);

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
      setLoadingCases(false);
    }
  }

  async function loadChat(caseId: string) {
    if (!caseId) return;

    try {
      setLoadingChat(true);

      const data = await getCaseChatMessages(caseId);

      if (data.length === 0) {
        setMessages([
          {
            role: "assistant",
            message:
              "Welcome. Ask eIPC AI anything about this case. I can help with legal route, evidence checklist, notices, replies and advocate-ready case summary.",
          },
        ]);
      } else {
        setMessages(
          data
            .filter((m: any) => m.role === "user" || m.role === "assistant")
            .map((m: any) => ({
              id: m.id,
              role: m.role,
              message: m.message,
            }))
        );
      }
    } catch (err: any) {
      alert(err.message || "Unable to load AI chat.");
    } finally {
      setLoadingChat(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadChat(selectedCaseId);
    }
  }, [selectedCaseId]);

  async function sendMessage() {
    if (!input.trim() || !selectedCaseId || !userId) return;

    const userMessage: ChatMessage = {
      role: "user",
      message: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setSending(true);

    try {
      await saveChatMessage({
        caseId: selectedCaseId,
        userId,
        role: "user",
        message: userMessage.message,
      });

      const res = await fetch("/api/legal-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            text: m.message,
          })),
          action: "client AI legal chat",
          caseId: selectedCaseId,
        }),
      });

      const data = await res.json();

      const aiReply =
        data.reply ||
        "Please share more facts, documents available, city, dates and the relief you want.";

      await saveChatMessage({
        caseId: selectedCaseId,
        userId,
        role: "assistant",
        message: aiReply,
      });

      await loadChat(selectedCaseId);
    } catch (err: any) {
      alert(err.message || "Unable to send AI message.");
    } finally {
      setSending(false);
    }
  }

  function getMessageLabel(role: string) {
    return role === "assistant" ? "eIPC AI" : "Client";
  }

  function getMessageStyle(role: string) {
    if (role === "user") return "bg-slate-950 text-white";
    return "bg-white text-slate-800 shadow";
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Legal Assistant</h2>
          <p className="text-sm text-slate-500">
            Ask eIPC AI for legal guidance, evidence checklist, draft strategy and case preparation support.
          </p>
        </div>

        <select
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          className="rounded-2xl border p-3 text-sm"
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} — {c.case_type}
            </option>
          ))}
        </select>
      </div>

      {loadingCases ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          Loading cases...
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          Please create a case file first from <b>My Case Files</b>. AI chat history must be linked to a case.
        </div>
      ) : (
        <>
          <div className="h-[460px] overflow-y-auto rounded-2xl bg-slate-50 p-4">
            {loadingChat ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow">
                Loading AI chat...
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={m.id || i}
                  className={`mb-4 flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-4 text-sm leading-6 ${getMessageStyle(
                      m.role
                    )}`}
                  >
                    <div className="mb-1 text-xs font-semibold opacity-60">
                      {getMessageLabel(m.role)}
                    </div>
                    {m.message}
                  </div>
                </div>
              ))
            )}

            {sending && (
              <div className="mb-4 flex justify-start">
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow">
                  eIPC AI is preparing response...
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[70px] flex-1 rounded-2xl border p-3 text-sm"
              placeholder="Ask eIPC AI about this case..."
            />

            <button
              onClick={sendMessage}
              disabled={sending}
              className="rounded-2xl bg-slate-950 px-6 font-semibold text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </>
      )}
    </section>
  );
}