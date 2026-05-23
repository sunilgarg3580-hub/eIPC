"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import { getClientCases } from "@/lib/caseService";
import {
  getEvidenceFiles,
  getEvidenceSignedUrl,
  uploadEvidenceFile,
} from "@/lib/evidenceService";

type CaseRecord = {
  id: string;
  title: string;
  case_type: string;
};

type EvidenceRecord = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  notes: string | null;
  created_at: string;
};

export function EvidenceVault() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [userId, setUserId] = useState("");
  const [files, setFiles] = useState<EvidenceRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadCases() {
    try {
      setLoading(true);

      const session = await getCurrentUser();
      if (!session?.user?.id) return;

      setUserId(session.user.id);

      const data = await getClientCases(session.user.id);
      setCases(data);

      if (data.length > 0) setSelectedCaseId(data[0].id);
    } finally {
      setLoading(false);
    }
  }

  async function loadEvidence(caseId: string) {
    if (!caseId) return;
    const data = await getEvidenceFiles(caseId);
    setFiles(data);
  }

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) loadEvidence(selectedCaseId);
  }, [selectedCaseId]);

  async function handleUpload() {
    try {
      if (!selectedCaseId || !userId || !selectedFile) {
        alert("Please select case and file.");
        return;
      }

      setUploading(true);

      await uploadEvidenceFile({
        caseId: selectedCaseId,
        userId,
        file: selectedFile,
        notes,
      });

      setSelectedFile(null);
      setNotes("");
      await loadEvidence(selectedCaseId);

      alert("Evidence uploaded successfully.");
    } catch (err: any) {
      alert(err.message || "Unable to upload evidence.");
    } finally {
      setUploading(false);
    }
  }

  async function openFile(filePath: string) {
    const url = await getEvidenceSignedUrl(filePath);
    window.open(url, "_blank");
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold">Evidence Vault</h2>
      <p className="mt-1 text-sm text-slate-500">
        Upload documents, PDFs, screenshots, agreements, invoices, notices and other case evidence.
      </p>

      {loading ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
          Loading cases...
        </div>
      ) : cases.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">
          Please create a case file first.
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-3xl border bg-slate-50 p-5">
            <div className="grid gap-3 md:grid-cols-2">
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

              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="rounded-2xl border bg-white p-3 text-sm"
              />

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="rounded-2xl border bg-white p-3 text-sm md:col-span-2"
                placeholder="Notes about this evidence, e.g. invoice for goods supplied, WhatsApp admission, rent agreement..."
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Evidence"}
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {files.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                No evidence uploaded for this case yet.
              </div>
            ) : (
              files.map((f) => (
                <div key={f.id} className="rounded-3xl border bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{f.file_name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Type: {f.file_type} • Uploaded:{" "}
                        {new Date(f.created_at).toLocaleDateString()}
                      </p>
                      {f.notes && (
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {f.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => openFile(f.file_url)}
                      className="rounded-2xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                    >
                      View File
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}