import { supabase } from "./supabaseClient";

export async function registerClient(data: {
  email: string;
  password: string;
  fullName: string;
  mobile: string;
  city: string;
  preferredLanguage: string;
  caseType: string;
  caseSummary: string;
}) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) throw authError;

  const userId = authData.user?.id;
  if (!userId) throw new Error("User was not created.");

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role: "client",
    full_name: data.fullName,
    mobile: data.mobile,
    email: data.email,
    city: data.city,
    preferred_language: data.preferredLanguage,
  });

  if (profileError) throw profileError;

  if (data.caseSummary) {
    const { error: caseError } = await supabase.from("cases").insert({
      client_id: userId,
      title: data.caseType || "New Legal Matter",
      case_type: data.caseType,
      city: data.city,
      facts: data.caseSummary,
      status: "new",
    });

    if (caseError) throw caseError;
  }

  return authData;
}

export async function registerAdvocate(data: {
  email: string;
  password: string;
  fullName: string;
  mobile: string;
  city: string;
  barRegistrationNumber: string;
  stateBarCouncil: string;
  yearsOfExperience: number;
  practiceArea: string;
  profileSummary: string;
}) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) throw authError;

  const userId = authData.user?.id;
  if (!userId) throw new Error("User was not created.");

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role: "advocate",
    full_name: data.fullName,
    mobile: data.mobile,
    email: data.email,
    city: data.city,
  });

  if (profileError) throw profileError;

  const { error: advocateError } = await supabase.from("advocate_profiles").insert({
    id: userId,
    bar_registration_number: data.barRegistrationNumber,
    state_bar_council: data.stateBarCouncil,
    years_of_experience: data.yearsOfExperience,
    practice_city: data.city,
    practice_areas: [data.practiceArea],
    profile_summary: data.profileSummary,
  });

  if (advocateError) throw advocateError;

  return authData;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const userId = data.user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  return { user: data.user, profile };
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}