import { supabase } from "./supabaseClient";

export async function sendCaseMessage(data: {
  caseId: string;
  userId: string;
  role: "user" | "assistant" | "advocate";
  message: string;
}) {
  const { data: saved, error } = await supabase
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
  return saved;
}

export async function getCaseMessages(caseId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}import { getCurrentUser } from "./session";

export async function requireRole(allowedRoles: string[]) {
  const session = await getCurrentUser();

  if (!session?.user || !session?.profile) {
    throw new Error("Please login to continue.");
  }

  if (!allowedRoles.includes(session.profile.role)) {
    throw new Error("You are not authorized to perform this action.");
  }

  return session;
}

export async function getUnreadMessagesForClient(clientId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select(`
      *,
      cases!inner (
        id,
        client_id
      )
    `)
    .eq("cases.client_id", clientId)
    .eq("role", "advocate")
    .eq("read_by_client", false);

  if (error) throw error;
  return data || [];
}

export async function getUnreadMessagesForAdvocate(advocateId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select(`
      *,
      cases!inner (
        id,
        assigned_advocate_id
      )
    `)
    .eq("cases.assigned_advocate_id", advocateId)
    .eq("role", "user")
    .eq("read_by_advocate", false);

  if (error) throw error;
  return data || [];
}

export async function markClientMessagesRead(caseId: string) {
  const { error } = await supabase
    .from("chat_messages")
    .update({ read_by_client: true })
    .eq("case_id", caseId)
    .eq("role", "advocate");

  if (error) throw error;
}

export async function markAdvocateMessagesRead(caseId: string) {
  const { error } = await supabase
    .from("chat_messages")
    .update({ read_by_advocate: true })
    .eq("case_id", caseId)
    .eq("role", "user");

  if (error) throw error;
}