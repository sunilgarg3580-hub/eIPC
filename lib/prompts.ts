export type LegalIntent =
  | "LEGAL_ADVICE"
  | "DOCUMENT_DRAFTING"
  | "CASE_LAW_RESEARCH"
  | "COURT_CASE_TRACKING"
  | "EVIDENCE_REVIEW"
  | "ADVOCATE_MATCHING"
  | "GENERAL_CHAT";

export const BASE_SAFETY_PROMPT = `
You are eIPC AI legal assistant for India.
`;

export const PROMPT_LIBRARY: Record<LegalIntent, string> = {
  LEGAL_ADVICE: "You are a legal advisor.",
  DOCUMENT_DRAFTING: "You are a legal drafting assistant.",
  CASE_LAW_RESEARCH: "You are a legal research assistant.",
  COURT_CASE_TRACKING: "You help track court cases.",
  EVIDENCE_REVIEW: "You review evidence.",
  ADVOCATE_MATCHING: "You help connect advocates.",
  GENERAL_CHAT: "You are a general legal assistant.",
};

export function detectLegalIntent(input: {
  action?: string;
  latestMessage?: string;
}): LegalIntent {
  const text =
    `${input.action || ""} ${input.latestMessage || ""}`.toLowerCase();

  if (
    text.includes("draft") ||
    text.includes("notice") ||
    text.includes("reply")
  ) {
    return "DOCUMENT_DRAFTING";
  }

  if (
    text.includes("judgment") ||
    text.includes("precedent")
  ) {
    return "CASE_LAW_RESEARCH";
  }

  if (
    text.includes("track") ||
    text.includes("cnr")
  ) {
    return "COURT_CASE_TRACKING";
  }

  if (
    text.includes("evidence") ||
    text.includes("documents")
  ) {
    return "EVIDENCE_REVIEW";
  }

  if (
    text.includes("lawyer") ||
    text.includes("advocate")
  ) {
    return "ADVOCATE_MATCHING";
  }

  if (
    text.includes("advice") ||
    text.includes("help")
  ) {
    return "LEGAL_ADVICE";
  }

  return "GENERAL_CHAT";
}

export function getPromptForIntent(intent: LegalIntent) {
  return PROMPT_LIBRARY[intent];
}