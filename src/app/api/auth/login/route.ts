import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/features/auth/service";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { user, token } = await loginUser(json);

    const response = NextResponse.json({ success: true, user });
    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "E-mail ou senha incorretos.") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Erro interno ao realizar login." },
      { status: 500 }
    );
  }
}
