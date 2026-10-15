import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/features/auth/service";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { user, token } = await registerUser(json);

    const response = NextResponse.json({ success: true, user }, { status: 201 });
    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "Este e-mail já está cadastrado.") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Erro interno ao cadastrar usuário." },
      { status: 500 }
    );
  }
}
