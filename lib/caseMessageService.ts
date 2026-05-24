import { supabase } from "./supabaseClient";

export async function sendCaseHumanMessage(data: {
  caseId: string;
  senderId: string;
  role: "client" | "advocate" | "system";
  message: string;
}) {
  const { data: saved, error } = await supabase
    .from("case_messages")
    .insert({
      case_id: data.caseId,
      sender_id: data.senderId,
      role: data.role,
      message: data.message,
      is_read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return saved;
}

export async function getCaseHumanMessages(caseId: string) {
  const { data, error } = await supabase
    .from("case_messages")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function markCaseMessagesRead(caseId: string, readerRole: "client" | "advocate") {
  const oppositeRole = readerRole === "client" ? "advocate" : "client";

  const { error } = await supabase
    .from("case_messages")
    .update({ is_read: true })
    .eq("case_id", caseId)
    .eq("role", oppositeRole);

  if (error) throw error;
}

export async function getUnreadHumanMessagesForClient(clientId: string) {
  const { data, error } = await supabase
    .from("case_messages")
    .select(`
      *,
      cases!inner (
        id,
        client_id
      )
    `)
    .eq("cases.client_id", clientId)
    .eq("role", "advocate")
    .eq("is_read", false);

  if (error) throw error;
  return data || [];
}

export async function getUnreadHumanMessagesForAdvocate(advocateId: string) {
  const { data, error } = await supabase
    .from("case_messages")
    .select(`
      *,
      cases!inner (
        id,
        assigned_advocate_id
      )
    `)
    .eq("cases.assigned_advocate_id", advocateId)
    .eq("role", "client")
    .eq("is_read", false);

  if (error) throw error;
  return data || [];
}