import OpenAI from "openai";
import { NextResponse } from "next/server";
import { detectLegalIntent, getPromptForIntent } from "@/lib/prompts";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, caseFacts, action, caseId } = await req.json();

    const latestMessage =
      messages?.length > 0
        ? messages[messages.length - 1]?.text || messages[messages.length - 1]?.content || ""
        : "";

    const intent = detectLegalIntent({
      action,
      latestMessage,
    });

    const systemPrompt = getPromptForIntent(intent);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `
Intent detected: ${intent}
Action requested: ${action || "general legal chat"}
Case ID: ${caseId || "not provided"}

Known case facts:
${caseFacts || "No structured case facts provided."}

Conversation:
${JSON.stringify(messages || [], null, 2)}
          `,
        },
      ],
    });

    return NextResponse.json({
      intent,
      reply: response.choices[0]?.message?.content || "No response received.",
    });
  } catch (error: any) {
    console.error("LEGAL_CHAT_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}