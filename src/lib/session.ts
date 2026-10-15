import "server-only";
import { validateSessionToken } from "@/features/auth/service";

export const SESSION_COOKIE_NAME = "zuck_session_id";
export const AUTH_COOKIE_NAME = "zuck_auth_token";
export const DEFAULT_DEMO_USER_ID = "usr_demo_user";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365,
};

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30, // 30 dias
};

const USER_ID_FORMAT = /^usr_[a-zA-Z0-9_-]{8,64}$/;

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export interface ResolvedSession {
  userId: string;
  isNew: boolean;
  isAuthenticated: boolean;
  user: SessionUser | null;
}

function parseCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1]?.trim() ?? null;
}

/**
 * Resolve o usuário da requisição HTTP:
 * 1. Prioriza token de autenticação em zuck_auth_token (validado no banco/sessões).
 * 2. Em fallback, aceita cookie anônimo zuck_session_id.
 * 3. Se nenhum existir, gera um novo id anônimo.
 */
export async function resolveUserSession(req: Request): Promise<ResolvedSession> {
  const authToken = parseCookie(req, AUTH_COOKIE_NAME);
  if (authToken) {
    const valid = await validateSessionToken(authToken);
    if (valid) {
      return {
        userId: valid.user.id,
        isNew: false,
        isAuthenticated: true,
        user: valid.user,
      };
    }
  }

  const anonId = parseCookie(req, SESSION_COOKIE_NAME);
  if (anonId && USER_ID_FORMAT.test(anonId)) {
    return {
      userId: anonId,
      isNew: false,
      isAuthenticated: false,
      user: null,
    };
  }

  const generatedId = `usr_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  return {
    userId: generatedId,
    isNew: true,
    isAuthenticated: false,
    user: null,
  };
}
