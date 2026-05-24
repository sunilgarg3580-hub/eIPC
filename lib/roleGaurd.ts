import { getCurrentUser } from "./session";

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