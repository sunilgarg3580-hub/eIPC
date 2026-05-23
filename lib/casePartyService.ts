import { supabase } from "./supabaseClient";

export async function getCaseParties(caseId: string) {
  const { data, error } = await supabase
    .from("case_parties")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function upsertOppositeParty(data: {
  caseId: string;
  name: string;
  fatherName?: string;
  address?: string;
  mobile?: string;
  email?: string;
  roleDescription?: string;
}) {
  const existing = await getCaseParties(data.caseId);
  const current = existing.find((p: any) => p.party_type === "opposite_party");

  if (current) {
    const { data: updated, error } = await supabase
      .from("case_parties")
      .update({
        name: data.name,
        father_name: data.fatherName || null,
        address: data.address || null,
        mobile: data.mobile || null,
        email: data.email || null,
        role_description: data.roleDescription || null,
      })
      .eq("id", current.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from("case_parties")
    .insert({
      case_id: data.caseId,
      party_type: "opposite_party",
      name: data.name,
      father_name: data.fatherName || null,
      address: data.address || null,
      mobile: data.mobile || null,
      email: data.email || null,
      role_description: data.roleDescription || null,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}