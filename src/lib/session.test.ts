import { describe, expect, it } from "vitest";
import { resolveUserSession, SESSION_COOKIE_NAME } from "./session";

describe("Session management", () => {
  it("extrai userId existente a partir do cookie da requisição", () => {
    const req = new Request("http://localhost:3000/api/chat", {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=usr_custom_session_99; other=123`,
      },
    });

    const session = resolveUserSession(req);
    expect(session.userId).toBe("usr_custom_session_99");
    expect(session.isNew).toBe(false);
  });

  it("rejeita userId com formato inválido e gera nova sessão segura", () => {
    const req = new Request("http://localhost:3000/api/chat", {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=malicious-token-or-sql-injection; other=123`,
      },
    });

    const session = resolveUserSession(req);
    expect(session.userId).toMatch(/^usr_[a-f0-9]{16}$/);
    expect(session.isNew).toBe(true);
  });
});
