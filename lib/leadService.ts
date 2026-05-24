import { supabase } from "./supabaseClient";

export async function createAdvocateLead(data: {
  clientId: string;
  caseId: string;
  matterSummary: string;
  city: string;
  urgency: string;
}) {
  const { data: existingLead } = await supabase
    .from("advocate_leads")
    .select("*")
    .eq("case_id", data.caseId)
    .in("status", ["new", "accepted"])
    .maybeSingle();

  if (existingLead) {
    return existingLead;
  }

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

export async function acceptLead(data: {
  leadId: string;
  advocateId: string;
  caseId: string;
}) {
  const { error: leadError } = await supabase
    .from("advocate_leads")
    .update({
      advocate_id: data.advocateId,
      status: "accepted",
    })
    .eq("id", data.leadId);

  if (leadError) throw leadError;

  const { error: caseError } = await supabase
    .from("cases")
    .update({
      assigned_advocate_id: data.advocateId,
      status: "advocate_assigned",
    })
    .eq("id", data.caseId);

  if (caseError) throw caseError;

  return true;
}
export async function getAcceptedAdvocateCases(advocateId: string) {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("assigned_advocate_id", advocateId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAdvocateDashboardStats(advocateId: string) {
  const [openLeads, acceptedCases] = await Promise.all([
    getAllOpenLeads(),
    getAcceptedAdvocateCases(advocateId),
  ]);

  return {
    newLeads: openLeads.length,
    activeClients: acceptedCases.length,
    reviewRequests: acceptedCases.length,
    clientMessages: 0,
  };
}