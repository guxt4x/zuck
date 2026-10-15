import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("Password hashing & verification", () => {
  it("gera um hash seguro formatado com salt e derived key", () => {
    const hash = hashPassword("minhasenha123");
    expect(hash).toContain(":");
    const [salt, key] = hash.split(":");
    expect(salt).toHaveLength(32); // 16 bytes hex
    expect(key).toHaveLength(128); // 64 bytes hex
  });

  it("verifica corretamente senha válida", () => {
    const password = "senhaForteSuperSegura#2026";
    const hash = hashPassword(password);
    expect(verifyPassword(password, hash)).toBe(true);
  });

  it("rejeita senha incorreta", () => {
    const hash = hashPassword("senhaCorreta");
    expect(verifyPassword("senhaIncorreta", hash)).toBe(false);
  });

  it("rejeita hashes malformados com segurança sem estourar exceção não tratada", () => {
    expect(verifyPassword("senha", "malformed_hash")).toBe(false);
    expect(verifyPassword("senha", "")).toBe(false);
    expect(verifyPassword("senha", "invalid:hex:extra")).toBe(false);
  });
});
