import { supabase } from "./supabaseClient";

export async function uploadEvidenceFile(data: {
  caseId: string;
  userId: string;
  file: File;
  notes?: string;
}) {
  const fileExt = data.file.name.split(".").pop();
  const filePath = `${data.caseId}/${Date.now()}-${data.file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("evidence-files")
    .upload(filePath, data.file);

  if (uploadError) throw uploadError;

  const { data: signedUrlData, error: signedUrlError } =
    await supabase.storage
      .from("evidence-files")
      .createSignedUrl(filePath, 60 * 60);

  if (signedUrlError) throw signedUrlError;

  const { data: savedFile, error: dbError } = await supabase
    .from("evidence_files")
    .insert({
      case_id: data.caseId,
      uploaded_by: data.userId,
      file_name: data.file.name,
      file_url: filePath,
      file_type: fileExt || data.file.type,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (dbError) throw dbError;

  return {
    ...savedFile,
    signedUrl: signedUrlData.signedUrl,
  };
}

export async function getEvidenceFiles(caseId: string) {
  const { data, error } = await supabase
    .from("evidence_files")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getEvidenceSignedUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from("evidence-files")
    .createSignedUrl(filePath, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
}