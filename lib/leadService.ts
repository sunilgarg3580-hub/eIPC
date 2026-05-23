import { supabase } from "./supabaseClient";

export async function createAdvocateLead(data: {
  clientId: string;
  caseId: string;
  matterSummary: string;
  city: string;
  urgency: string;
}) {
  const { data: lead, error } = await supabase
    .from("advocate_leads")
    .insert({
      client_id: data.clientId,
      case_id: data.caseId,
      matter_summary: data.matterSummary,
      city: data.city,
      urgency: data.urgency,
      status: "new",
    })
    .select()
    .single();

  if (error) throw error;
  return lead;
}

export async function getAllOpenLeads() {
  const { data, error } = await supabase
    .from("advocate_leads")
    .select(`
      *,
      cases (
        title,
        case_type,
        facts,
        city
      ),
      profiles (
        full_name,
        mobile,
        email,
        city
      )
    `)
    .eq("status", "new")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}