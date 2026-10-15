import { NextResponse } from "next/server";
import { resolveUserSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await resolveUserSession(req);

    return NextResponse.json({
      isAuthenticated: session.isAuthenticated,
      user: session.user,
      userId: session.userId,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao verificar estado da sessão." },
      { status: 500 }
    );
  }
}
