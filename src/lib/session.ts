import "server-only";

export const SESSION_COOKIE_NAME = "zuck_session_id";
export const DEFAULT_DEMO_USER_ID = "usr_demo_user";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365,
};

const USER_ID_FORMAT = /^usr_[a-zA-Z0-9_-]{8,64}$/;

export interface ResolvedSession {
  userId: string;
  isNew: boolean;
}

/**
 * Resolve e sanitiza o identificador do usuário a partir dos headers da requisição HTTP.
 * Se o cookie for ausente ou possuir formato inválido, gera um novo identificador anônimo seguro.
 */
export function resolveUserSession(req: Request): ResolvedSession {
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    const candidateId = match?.[1]?.trim();
    if (candidateId && USER_ID_FORMAT.test(candidateId)) {
      return {
        userId: candidateId,
        isNew: false,
      };
    }
  }

  // Gera identificador único anônimo seguro
  const generatedId = `usr_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  return {
    userId: generatedId,
    isNew: true,
  };
}
