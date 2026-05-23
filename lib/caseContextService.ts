import { getCaseById } from "./caseService";
import { getProfile } from "./profileService";
import { getCaseParties } from "./casePartyService";
import { getCaseChatMessages } from "./chatService";
import { getEvidenceFiles } from "./evidenceService";

export async function getFullCaseContext(caseId: string, userId: string) {
  const [caseFile, clientProfile, parties, chatMessages, evidenceFiles] =
    await Promise.all([
      getCaseById(caseId),
      getProfile(userId),
      getCaseParties(caseId),
      getCaseChatMessages(caseId),
      getEvidenceFiles(caseId),
    ]);

  return {
    caseFile,
    clientProfile,
    parties,
    oppositeParty:
      parties.find((p: any) => p.party_type === "opposite_party") || null,
    chatMessages,
    evidenceFiles,
  };
}

export function formatCaseContextForPrompt(context: any) {
  const { caseFile, clientProfile, oppositeParty, chatMessages, evidenceFiles } =
    context;

  return `
CLIENT PROFILE:
Name: ${clientProfile?.full_name || "[Client Name]"}
Father/Spouse Name: ${clientProfile?.father_name || "[Father/Spouse Name]"}
Address: ${clientProfile?.address || "[Client Address]"}
City: ${clientProfile?.city || "[City]"}
State: ${clientProfile?.state || "[State]"}
Mobile: ${clientProfile?.mobile || "[Mobile]"}
Email: ${clientProfile?.email || "[Email]"}
Occupation: ${clientProfile?.occupation || "[Occupation]"}

OPPOSITE PARTY:
Name: ${oppositeParty?.name || "[Opposite Party Name]"}
Father/Spouse Name: ${oppositeParty?.father_name || "[Father/Spouse Name]"}
Address: ${oppositeParty?.address || "[Opposite Party Address]"}
Mobile: ${oppositeParty?.mobile || "[Mobile]"}
Email: ${oppositeParty?.email || "[Email]"}
Role: ${oppositeParty?.role_description || "[Role/Relationship]"}

CASE DETAILS:
Title: ${caseFile?.title || ""}
Type: ${caseFile?.case_type || ""}
City: ${caseFile?.city || ""}
Court: ${caseFile?.court_name || "Not provided"}
CNR: ${caseFile?.cnr_number || "Not provided"}

CASE FACTS:
${caseFile?.facts || ""}

EVIDENCE / DOCUMENTS:
${
  evidenceFiles?.length
    ? evidenceFiles
        .map(
          (f: any, i: number) =>
            `${i + 1}. ${f.file_name} — ${f.notes || "No notes"}`
        )
        .join("\n")
    : "No evidence uploaded."
}

RECENT CHAT HISTORY:
${
  chatMessages?.length
    ? chatMessages
        .slice(-10)
        .map((m: any) => `${m.role}: ${m.message}`)
        .join("\n")
    : "No chat history."
}
`;
}