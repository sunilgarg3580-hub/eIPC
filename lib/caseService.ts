import { supabase } from "./supabaseClient";

export async function createCase(data: {
  clientId: string;
  title: string;
  caseType: string;
  city: string;
  facts: string;
  cnrNumber?: string;
  courtName?: string;
}) {
  const { data: newCase, error } = await supabase
    .from("cases")
    .insert({
      client_id: data.clientId,
      title: data.title,
      case_type: data.caseType,
      city: data.city,
      facts: data.facts,
      cnr_number: data.cnrNumber || null,
      court_name: data.courtName || null,
      status: "new",
    })
    .select()
    .single();

  if (error) throw error;
  return newCase;
}

export async function getClientCases(clientId: string) {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCaseById(caseId: string) {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateCaseStatus(caseId: string, status: string) {
  const { data, error } = await supabase
    .from("cases")
    .update({ status })
    .eq("id", caseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}