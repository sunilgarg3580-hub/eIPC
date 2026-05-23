import { supabase } from "./supabaseClient";

export async function saveChatMessage(data: {
  caseId: string;
  userId: string;
  role: "user" | "assistant" | "advocate";
  message: string;
}) {
  const { data: savedMessage, error } = await supabase
    .from("chat_messages")
    .insert({
      case_id: data.caseId,
      user_id: data.userId,
      role: data.role,
      message: data.message,
    })
    .select()
    .single();

  if (error) throw error;
  return savedMessage;
}

export async function getCaseChatMessages(caseId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}