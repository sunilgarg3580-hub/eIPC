"use client";

import { useState } from "react";
import { GUEST } from "@/lib/content";
import type { ChatMessage } from "@/lib/types";

export function GuestHome({
  openClientLogin,
  openAdvocateLogin,
}: {
  openClientLogin: () => void;
  openAdvocateLogin: () => void;
}) {
  const [guestMessages, setGuestMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: GUEST.welcome },
  ]);
  const [guestInput, setGuestInput] = useState("");
  const [guestCount, setGuestCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  async function sendGuestMessage() {
    if (!guestInput.trim()) return;

    const updated: ChatMessage[] = [...guestMessages, { role: "user", text: guestInput }];
    const nextCount = guestCount + 1;

    setGuestMessages(updated);
    setGuestInput("");
    setGuestCount(nextCount);
    setLoading(true);

    try {
      const res = await fetch("/api/legal-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, action: "guest legal guidance" }),
      });
      const data = await res.json();
      setGuestMessages([...updated, { role: "assistant", text: data.reply || GUEST.emptyReply }]);
    } catch {
      setGuestMessages([...updated, { role: "assistant", text: GUEST.fallback }]);
    } finally {
      setLoading(false);
    }

    if (nextCount >= 3) setShowSignupPrompt(true);
  }

  function requireClientLogin() {
    setShowSignupPrompt(true);
    openClientLogin();
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                {GUEST.chatBadge}
              </div>
              <h2 className="mt-4 text-3xl font-bold">{GUEST.chatTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{GUEST.chatSubtitle}</p>
            </div>
          </div>

          <div className="h-[470px] overflow-y-auto rounded-3xl bg-slate-50 p-4">
            {guestMessages.map((m, i) => (
              <div key={i} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-4 text-sm leading-6 ${m.role === "user" ? "bg-slate-950 text-white" : "bg-white text-slate-800 shadow"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mb-4 flex justify-start">
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow">{GUEST.loading}</div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <textarea
              value={guestInput}
              onChange={(e) => setGuestInput(e.target.value)}
              placeholder={GUEST.inputPlaceholder}
              className="min-h-[76px] flex-1 rounded-2xl border p-3 text-sm outline-none focus:border-slate-900"
            />
            <button onClick={sendGuestMessage} disabled={loading} className="rounded-2xl bg-slate-950 px-7 font-semibold text-white disabled:opacity-50">
              {GUEST.send}
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {GUEST.actionButtons.map((action) => (
              <button key={action.label} onClick={requireClientLogin} className="rounded-2xl border p-3 text-sm font-semibold hover:bg-slate-50">
                {action.icon} {action.label}
              </button>
            ))}
          </div>

          {showSignupPrompt && (
            <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              {GUEST.signupPrompt}
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-[32px] bg-slate-950 p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">{GUEST.heroBadge}</div>
            <h1 className="mt-6 text-4xl font-bold leading-tight">{GUEST.heroTitle}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">{GUEST.heroDescription}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {GUEST.features.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                  <div className="text-2xl">{feature.icon}</div>
                  <h3 className="mt-3 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={openClientLogin} className="rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-950">
                {GUEST.clientAccount}
              </button>
              <button onClick={openAdvocateLogin} className="rounded-2xl border border-white/20 px-6 py-4 text-sm font-bold text-white">
                {GUEST.advocateAccount}
              </button>
            </div>
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5 text-sm leading-6 text-slate-300">
              {GUEST.advocateNote}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
