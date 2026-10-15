import { describe, expect, it } from "vitest";
import {
  loginUser,
  logoutUser,
  registerUser,
  validateSessionToken,
} from "./service";

describe("Auth service", () => {
  const uniqueEmail = `test_${Date.now()}@exemplo.com`;
  const password = "senhaSuperSegura123";

  it("registra um novo usuário com sucesso e cria uma sessão válida", async () => {
    const result = await registerUser({
      email: uniqueEmail,
      password,
      name: "Usuário Teste",
    });

    expect(result.user.email).toBe(uniqueEmail);
    expect(result.user.name).toBe("Usuário Teste");
    expect(result.token).toBeDefined();
    expect(result.token.length).toBeGreaterThan(20);

    // Valida o token gerado
    const validated = await validateSessionToken(result.token);
    expect(validated).not.toBeNull();
    expect(validated?.user.id).toBe(result.user.id);
  });

  it("impede registro de e-mail duplicado", async () => {
    await expect(
      registerUser({
        email: uniqueEmail,
        password: "outraSenha123",
      })
    ).rejects.toThrow("Este e-mail já está cadastrado.");
  });

  it("realiza login com credenciais corretas", async () => {
    const result = await loginUser({
      email: uniqueEmail,
      password,
    });

    expect(result.user.email).toBe(uniqueEmail);
    expect(result.token).toBeDefined();
  });

  it("rejeita login com senha incorreta", async () => {
    await expect(
      loginUser({
        email: uniqueEmail,
        password: "senhaErrada",
      })
    ).rejects.toThrow("E-mail ou senha incorretos.");
  });

  it("rejeita login de e-mail inexistente", async () => {
    await expect(
      loginUser({
        email: "inexistente@exemplo.com",
        password: "qualquerSenha",
      })
    ).rejects.toThrow("E-mail ou senha incorretos.");
  });

  it("invalida sessão após logout", async () => {
    const loginResult = await loginUser({
      email: uniqueEmail,
      password,
    });

    const validatedBefore = await validateSessionToken(loginResult.token);
    expect(validatedBefore).not.toBeNull();

    await logoutUser(loginResult.token);

    const validatedAfter = await validateSessionToken(loginResult.token);
    expect(validatedAfter).toBeNull();
  });
});
