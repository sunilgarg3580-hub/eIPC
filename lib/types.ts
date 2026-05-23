export type Role = "guest" | "client" | "advocate";
export type LoginMode = "none" | "client" | "advocate";

export type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};
