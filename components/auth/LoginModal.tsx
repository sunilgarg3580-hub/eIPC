"use client";

import React, { useState } from "react";
import { loginUser, registerAdvocate, registerClient } from "@/lib/authService";
import type { Role } from "@/lib/types";

export function LoginModal({
  mode,
  onClose,
  onLogin,
}: {
  mode: "client" | "advocate";
  onClose: () => void;
  onLogin: (role: Role) => void;
}) {
  const isAdvocate = mode === "advocate";
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    mobile: "",
    city: "",
    preferredLanguage: "English",
    caseType: "",
    caseSummary: "",
    barRegistrationNumber: "",
    stateBarCouncil: "",
    yearsOfExperience: "",
    practiceArea: "",
    profileSummary: "",
  });

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      if (authMode === "login") {
        const result = await loginUser(form.email, form.password);
        onLogin(result.profile.role as Role);
        return;
      }

      if (isAdvocate) {
        await registerAdvocate({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          mobile: form.mobile,
          city: form.city,
          barRegistrationNumber: form.barRegistrationNumber,
          stateBarCouncil: form.stateBarCouncil,
          yearsOfExperience: Number(form.yearsOfExperience || 0),
          practiceArea: form.practiceArea,
          profileSummary: form.profileSummary,
        });

        alert("Advocate account created successfully.");
        onLogin("advocate");
      } else {
        await registerClient({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          mobile: form.mobile,
          city: form.city,
          preferredLanguage: form.preferredLanguage,
          caseType: form.caseType,
          caseSummary: form.caseSummary,
        });

        alert("Client account created successfully.");
        onLogin("client");
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {isAdvocate ? "Advocate Portal" : "Client Portal"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isAdvocate
                ? "Login or register to receive leads, reply to clients and review drafts."
                : "Login or register to manage cases, drafts, evidence and court tracking."}
            </p>
          </div>

          <button onClick={onClose} className="rounded-full border px-3 py-1">
            X
          </button>
        </div>

        <div className="mt-6 flex rounded-2xl bg-slate-100 p-1">
          <button
            onClick={() => setAuthMode("login")}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${
              authMode === "login" ? "bg-slate-950 text-white" : "text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode("register")}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${
              authMode === "register" ? "bg-slate-950 text-white" : "text-slate-600"
            }`}
          >
            Register
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input label="Email" value={form.email} onChange={(v) => updateField("email", v)} />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => updateField("password", v)}
          />

          {authMode === "register" && (
            <>
              <Input
                label={isAdvocate ? "Advocate name" : "Full name"}
                value={form.fullName}
                onChange={(v) => updateField("fullName", v)}
              />
              <Input label="Mobile number" value={form.mobile} onChange={(v) => updateField("mobile", v)} />
              <Input label="City" value={form.city} onChange={(v) => updateField("city", v)} />

              {!isAdvocate && (
                <>
                  <Input
                    label="Preferred language"
                    value={form.preferredLanguage}
                    onChange={(v) => updateField("preferredLanguage", v)}
                  />
                  <Input label="Case type" value={form.caseType} onChange={(v) => updateField("caseType", v)} />
                  <textarea
                    className="rounded-2xl border p-3 text-sm md:col-span-2"
                    rows={4}
                    placeholder="Briefly describe your legal issue"
                    value={form.caseSummary}
                    onChange={(e) => updateField("caseSummary", e.target.value)}
                  />
                </>
              )}

              {isAdvocate && (
                <>
                  <Input
                    label="Bar registration number"
                    value={form.barRegistrationNumber}
                    onChange={(v) => updateField("barRegistrationNumber", v)}
                  />
                  <Input
                    label="State Bar Council"
                    value={form.stateBarCouncil}
                    onChange={(v) => updateField("stateBarCouncil", v)}
                  />
                  <Input
                    label="Years of experience"
                    value={form.yearsOfExperience}
                    onChange={(v) => updateField("yearsOfExperience", v)}
                  />
                  <Input
                    label="Practice specialization"
                    value={form.practiceArea}
                    onChange={(v) => updateField("practiceArea", v)}
                  />
                  <textarea
                    className="rounded-2xl border p-3 text-sm md:col-span-2"
                    rows={4}
                    placeholder="Profile summary, courts handled, languages, consultation preference"
                    value={form.profileSummary}
                    onChange={(e) => updateField("profileSummary", e.target.value)}
                  />
                </>
              )}
            </>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : authMode === "login"
            ? "Login"
            : isAdvocate
            ? "Create Advocate Account"
            : "Create Client Account"}
        </button>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          AI guidance and drafts are for support only. Final legal advice or filing should be reviewed by a licensed advocate.
        </p>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      className="rounded-2xl border p-3 text-sm"
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}