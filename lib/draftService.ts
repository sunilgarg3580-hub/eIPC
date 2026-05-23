import { supabase } from "./supabaseClient";

export async function createDraft(data: {
  caseId: string;
  createdBy: string;
  draftType: string;
  title: string;
  content: string;
}) {
  const { data: draft, error } = await supabase
    .from("drafts")
    .insert({
      case_id: data.caseId,
      created_by: data.createdBy,
      draft_type: data.draftType,
      title: data.title,
      content: data.content,
      status: "ai_draft",
    })
    .select()
    .single();

  if (error) throw error;
  return draft;
}

export async function getCaseDrafts(caseId: string) {
  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateDraftContent(data: {
  draftId: string;
  title: string;
  content: string;
}) {
  const { data: draft, error } = await supabase
    .from("drafts")
    .update({
      title: data.title,
      content: data.content,
      status: "edited_by_client",
    })
    .eq("id", data.draftId)
    .select()
    .single();

  if (error) throw error;
  return draft;
}