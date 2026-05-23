import { supabase } from "./supabaseClient";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(data: {
  userId: string;
  fullName: string;
  mobile: string;
  city: string;
  state?: string;
  preferredLanguage?: string;
  fatherName?: string;
  address?: string;
  pincode?: string;
  occupation?: string;
  gender?: string;
  dateOfBirth?: string;
}) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      mobile: data.mobile,
      city: data.city,
      state: data.state || null,
      preferred_language: data.preferredLanguage || null,
      father_name: data.fatherName || null,
      address: data.address || null,
      pincode: data.pincode || null,
      occupation: data.occupation || null,
      gender: data.gender || null,
      date_of_birth: data.dateOfBirth || null,
    })
    .eq("id", data.userId)
    .select()
    .single();

  if (error) throw error;
  return profile;
}