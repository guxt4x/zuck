import { NextResponse } from "next/server";
import { logoutUser } from "@/features/auth/service";
import { AUTH_COOKIE_NAME } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const match = cookieHeader?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
    const token = match?.[1]?.trim();

    if (token) {
      await logoutUser(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar encerramento de sessão." },
      { status: 500 }
    );
  }
}
