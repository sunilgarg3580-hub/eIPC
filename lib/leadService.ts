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
    .in("status", ["new", "pending_client_approval", "accepted"])
    .maybeSingle();

  if (existingLead) return existingLead;

  const { data: lead, error } = await supabase
    .from("advocate_leads")
    .insert({
      client_id: data.clientId,
      case_id: data.caseId,
      matter_summary: data.matterSummary,
      city: data.city,
      urgency: data.urgency,
      status: "new",
      advocate_id: null,
    })
    .select()
    .single();

  if (error) throw error;
  return lead;
}

export async function getAllOpenLeads(advocateId?: string) {
  let query = supabase
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
    .is("advocate_id", null)
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;

  if (!advocateId) return data || [];

  const { data: rejected } = await supabase
    .from("rejected_case_advocates")
    .select("case_id")
    .eq("advocate_id", advocateId);

  const rejectedCaseIds = new Set((rejected || []).map((r: any) => r.case_id));

  return (data || []).filter((lead: any) => !rejectedCaseIds.has(lead.case_id));
}

export async function unlockLeadFree(data: {
  leadId: string;
  advocateId: string;
  caseId: string;
}) {
  const { data: currentLead, error: fetchError } = await supabase
    .from("advocate_leads")
    .select("*")
    .eq("id", data.leadId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!currentLead) {
    throw new Error("Lead not found.");
  }

  if (currentLead.status !== "new" || currentLead.advocate_id !== null) {
    throw new Error("This lead is no longer available.");
  }

  const { error: leadError } = await supabase
    .from("advocate_leads")
    .update({
      advocate_id: data.advocateId,
      status: "pending_client_approval",
    })
    .eq("id", data.leadId);

  if (leadError) throw leadError;

  const { error: paymentError } = await supabase.from("payments").insert({
    user_id: data.advocateId,
    case_id: data.caseId,
    lead_id: data.leadId,
    payment_type: "advocate_lead_unlock",
    amount: 0,
    status: "free_access",
  });

  if (paymentError) throw paymentError;

  const { error: caseError } = await supabase
    .from("cases")
    .update({
      assigned_advocate_id: data.advocateId,
      status: "client_approval_pending",
    })
    .eq("id", data.caseId);

  if (caseError) throw caseError;

  return true;
}

export async function clientAcceptAdvocate(data: {
  leadId: string;
  clientId: string;
  caseId: string;
  advocateId: string;
}) {
  const { error: paymentError } = await supabase.from("payments").insert({
    user_id: data.clientId,
    case_id: data.caseId,
    lead_id: data.leadId,
    payment_type: "client_token",
    amount: 0,
    status: "free_access",
  });

  if (paymentError) throw paymentError;

  const { error: leadError } = await supabase
    .from("advocate_leads")
    .update({
      status: "accepted",
    })
    .eq("id", data.leadId)
    .eq("status", "pending_client_approval");

  if (leadError) throw leadError;

  const { error: caseError } = await supabase
    .from("cases")
    .update({
      status: "advocate_assigned",
      assigned_advocate_id: data.advocateId,
    })
    .eq("id", data.caseId);

  if (caseError) throw caseError;
}

export async function clientRejectAdvocate(data: {
  leadId: string;
  clientId: string;
  caseId: string;
  advocateId: string;
  reason?: string;
}) {
  const { error: rejectedError } = await supabase
    .from("rejected_case_advocates")
    .insert({
      case_id: data.caseId,
      advocate_id: data.advocateId,
      rejected_by: data.clientId,
      reason: data.reason || null,
    });

  if (rejectedError) throw rejectedError;

  const { error: leadError } = await supabase
    .from("advocate_leads")
    .update({
      status: "rejected_by_client",
    })
    .eq("id", data.leadId);

  if (leadError) throw leadError;

  const { error: caseError } = await supabase
    .from("cases")
    .update({
      status: "new",
      assigned_advocate_id: null,
    })
    .eq("id", data.caseId);

  if (caseError) throw caseError;

  const { data: oldLead, error: oldLeadError } = await supabase
    .from("advocate_leads")
    .select("*")
    .eq("id", data.leadId)
    .single();

  if (oldLeadError) throw oldLeadError;

  const { error: newLeadError } = await supabase.from("advocate_leads").insert({
    client_id: oldLead.client_id,
    case_id: oldLead.case_id,
    matter_summary: oldLead.matter_summary,
    city: oldLead.city,
    urgency: oldLead.urgency,
    status: "new",
    advocate_id: null,
  });

  if (newLeadError) throw newLeadError;
}

export async function getPendingClientApprovalLeads(clientId: string) {
  const { data: leads, error } = await supabase
    .from("advocate_leads")
    .select(`
      *,
      cases (
        title,
        case_type,
        facts,
        city
      )
    `)
    .eq("client_id", clientId)
    .eq("status", "pending_client_approval");

  if (error) throw error;

  const enrichedLeads = await Promise.all(
    (leads || []).map(async (lead: any) => {
      const { data: advocateProfile } = await supabase
        .from("profiles")
        .select("full_name, mobile, email, city")
        .eq("id", lead.advocate_id)
        .maybeSingle();

      const { data: advocateDetails } = await supabase
        .from("advocate_profiles")
        .select("*")
        .eq("id", lead.advocate_id)
        .maybeSingle();

      return {
        ...lead,
        advocateProfile,
        advocateDetails,
      };
    })
  );

  return enrichedLeads;
}

export async function getAcceptedAdvocateCases(advocateId: string) {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("assigned_advocate_id", advocateId)
    .in("status", ["advocate_assigned", "client_approval_pending"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAdvocateDashboardStats(advocateId: string) {
  const [openLeads, acceptedCases] = await Promise.all([
    getAllOpenLeads(advocateId),
    getAcceptedAdvocateCases(advocateId),
  ]);

  return {
    newLeads: openLeads.length,
    activeClients: acceptedCases.filter((c: any) => c.status === "advocate_assigned").length,
    reviewRequests: acceptedCases.filter((c: any) => c.status === "client_approval_pending").length,
    clientMessages: 0,
  };
}