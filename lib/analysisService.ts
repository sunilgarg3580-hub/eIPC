import { supabase } from "./supabaseClient";

export async function createCaseAnalysis(data: {
  caseId: string;
  createdBy: string;
  analysisType: string;
  content: string;
}) {
  const { data: analysis, error } = await supabase
    .from("case_analysis")
    .insert({
      case_id: data.caseId,
      created_by: data.createdBy,
      analysis_type: data.analysisType,
      content: data.content,
    })
    .select()
    .single();

  if (error) throw error;
  return analysis;
}

export async function getCaseAnalysis(caseId: string) {
  const { data, error } = await supabase
    .from("case_analysis")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}