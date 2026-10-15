import { NextResponse } from "next/server";
import { z } from "zod";
import { processChatMessage } from "@/lib/ai/client";
import { resolveUserSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, "Mensagem não pode ser vazia.").max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { message, history } = chatRequestSchema.parse(json);

    // Identificação de sessão segura por usuário isolado
    const { userId, isNew } = await resolveUserSession(req);

    // O assistente processa a mensagem via IA (Groq tool calling) ou fallback determinístico
    const reply = await processChatMessage(userId, message, history);

    const response = NextResponse.json({ reply });

    if (isNew) {
      response.cookies.set(SESSION_COOKIE_NAME, userId, SESSION_COOKIE_OPTIONS);
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno ao processar mensagem" },
      { status: 500 }
    );
  }
}
