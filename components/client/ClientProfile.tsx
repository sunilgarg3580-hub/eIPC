"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import { getProfile, updateProfile } from "@/lib/profileService";

export function ClientProfile() {
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    preferredLanguage: "",
    fatherName: "",
    address: "",
    pincode: "",
    occupation: "",
    gender: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const session = await getCurrentUser();
      if (!session?.user?.id) return;

      setUserId(session.user.id);

      const profile = await getProfile(session.user.id);

      setForm({
        fullName: profile.full_name || "",
        mobile: profile.mobile || "",
        city: profile.city || "",
        state: profile.state || "",
        preferredLanguage: profile.preferred_language || "",
        fatherName: profile.father_name || "",
        address: profile.address || "",
        pincode: profile.pincode || "",
        occupation: profile.occupation || "",
        gender: profile.gender || "",
        dateOfBirth: profile.date_of_birth || "",
      });
    }

    loadProfile();
  }, []);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveProfile() {
    try {
      setSaving(true);

      await updateProfile({
        userId,
        ...form,
      });

      alert("Profile updated successfully.");
    } catch (err: any) {
      alert(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold">My Profile</h2>
      <p className="mt-1 text-sm text-slate-500">
        These details will be used while preparing notices, replies and case documents.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Input label="Full Name" value={form.fullName} onChange={(v) => updateField("fullName", v)} />
        <Input label="Father / Spouse Name" value={form.fatherName} onChange={(v) => updateField("fatherName", v)} />
        <Input label="Mobile" value={form.mobile} onChange={(v) => updateField("mobile", v)} />
        <Input label="City" value={form.city} onChange={(v) => updateField("city", v)} />
        <Input label="State" value={form.state} onChange={(v) => updateField("state", v)} />
        <Input label="Pincode" value={form.pincode} onChange={(v) => updateField("pincode", v)} />
        <Input label="Occupation" value={form.occupation} onChange={(v) => updateField("occupation", v)} />
        <Input label="Gender" value={form.gender} onChange={(v) => updateField("gender", v)} />
        <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => updateField("dateOfBirth", v)} />
        <Input label="Preferred Language" value={form.preferredLanguage} onChange={(v) => updateField("preferredLanguage", v)} />

        <textarea
          className="rounded-2xl border p-3 text-sm md:col-span-2"
          rows={4}
          placeholder="Full Address"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
        />
      </div>

      <button
        onClick={saveProfile}
        disabled={saving}
        className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </section>
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