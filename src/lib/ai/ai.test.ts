import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AI_TOOLS, executeAiTool } from "./tools";
import { processChatMessage } from "./client";

describe("AI Tools Definition & Security Guardrails", () => {
  it("contém exatamente as 10 ferramentas do produto", () => {
    const toolNames = AI_TOOLS.map((t) => t.function.name);
    expect(toolNames).toContain("registrar_despesa");
    expect(toolNames).toContain("registrar_receita");
    expect(toolNames).toContain("consultar_saldo");
    expect(toolNames).toContain("consultar_gastos_por_categoria");
    expect(toolNames).toContain("consultar_resumo_periodo");
    expect(toolNames).toContain("listar_movimentacoes");
    expect(toolNames).toContain("criar_meta");
    expect(toolNames).toContain("consultar_metas");
    expect(toolNames).toContain("atualizar_meta");
    expect(toolNames).toContain("excluir_movimentacao");
    expect(toolNames.length).toBe(10);
  });

  it("regra inegociável: nenhuma ferramenta aceita userId vindo do modelo de IA", () => {
    for (const tool of AI_TOOLS) {
      const properties = (tool.function.parameters as { properties?: Record<string, unknown> })
        .properties;
      expect(properties).not.toHaveProperty("userId");
      expect(properties).not.toHaveProperty("user_id");
    }
  });

  it("rejeita chamada sem userId autenticado", async () => {
    await expect(executeAiTool("consultar_saldo", {}, "")).rejects.toThrow(
      "Usuário não autenticado."
    );
    await expect(executeAiTool("consultar_saldo", {}, "   ")).rejects.toThrow(
      "Usuário não autenticado."
    );
  });

  it("rejeita ferramenta inexistente", async () => {
    await expect(executeAiTool("ferramenta_fantasma", {}, "user_123")).rejects.toThrow(
      'Ferramenta desconhecida: "ferramenta_fantasma"'
    );
  });

  it("exclusão de movimentação exige confirmação explícita", async () => {
    const unconfirmed = (await executeAiTool(
      "excluir_movimentacao",
      { transactionId: "tx_1", confirmed: false },
      "user_123"
    )) as { status: string; message: string };

    expect(unconfirmed.status).toBe("confirmation_required");
    expect(unconfirmed.message).toContain("Confirmação necessária");
  });

  it("executa criar_meta com sucesso e persiste no repositório", async () => {
    const goal = (await executeAiTool(
      "criar_meta",
      { title: "Viagem", targetAmount: 5000 },
      "usr_goal_test"
    )) as { title: string; formattedTarget: string; progressPercent: number };

    expect(goal.title).toBe("Viagem");
    expect(goal.formattedTarget).toBe("R$ 5.000,00");
    expect(goal.progressPercent).toBe(0);
  });
});

describe("processChatMessage (Chat Agent Processor)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GROQ_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("fallback local: reconhece e formata registro de despesa", async () => {
    const reply = await processChatMessage("usr_1", "Gastei 45 no almoço");
    expect(reply).toContain("R$ 45,00");
  });

  it("fallback local: reconhece e formata registro de receita", async () => {
    const reply = await processChatMessage("usr_1", "Recebi 1800 de salário");
    expect(reply).toContain("R$ 1.800,00");
  });

  it("fallback local: responde consulta de saldo do usuário com valores reais acumulados", async () => {
    const reply = await processChatMessage("usr_1", "Qual meu saldo atual?");
    expect(reply).toContain("R$ 1.755,00");
    expect(reply).toContain("R$ 1.800,00");
    expect(reply).toContain("R$ 45,00");
  });

  it("fallback local: responde saldo zerado para usuário novo", async () => {
    const reply = await processChatMessage("usr_novo", "Qual meu saldo atual?");
    expect(reply).toContain("R$ 0,00");
  });

  it("fallback local: responde consulta de metas", async () => {
    const reply = await processChatMessage("usr_1", "Quais minhas metas?");
    expect(reply).toContain("metas");
  });

  it("integração Groq: executa chamada e processa resposta com Groq API Key", async () => {
    process.env.GROQ_API_KEY = "gsk_test_mock_key";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: "assistant",
              content: "Olá! Sou o ZUCK, seu copiloto financeiro.",
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const reply = await processChatMessage("usr_1", "Olá!");
    expect(reply).toBe("Olá! Sou o ZUCK, seu copiloto financeiro.");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("fluxo apagar tudo: pede confirmação se usuário pedir para apagar tudo", async () => {
    const reply = await processChatMessage("usr_reset", "apagar tudo");
    expect(reply).toContain("Tem certeza de que deseja apagar");
  });

  it("fluxo apagar tudo: executa exclusão quando usuário confirma com 'sim'", async () => {
    // 1. Registra um gasto prévio
    await processChatMessage("usr_reset", "Gastei 50 no mercado");

    // 2. Envia 'sim' com histórico de confirmação pendente
    const history = [
      { role: "user" as const, content: "apagar tudo" },
      {
        role: "assistant" as const,
        content: "⚠️ Tem certeza de que deseja apagar todas as suas movimentações e zerar seus registros? Responda com 'sim' para confirmar.",
      },
    ];

    const reply = await processChatMessage("usr_reset", "sim", history);
    expect(reply).toContain("Todas as suas movimentações foram apagadas e seu saldo foi zerado");

    // 3. Verifica que o saldo agora está zerado
    const balanceReply = await processChatMessage("usr_reset", "Qual meu saldo atual?");
    expect(balanceReply).toContain("R$ 0,00");
  });

  it("fluxo apagar tudo: executa imediatamente se o usuário já incluir confirmação explícita", async () => {
    await processChatMessage("usr_direct_reset", "Recebi 1000 de salário");
    const reply = await processChatMessage("usr_direct_reset", "quero apagar tudo, confirmo");
    expect(reply).toContain("Todas as suas movimentações foram apagadas e seu saldo foi zerado");

    const balanceReply = await processChatMessage("usr_direct_reset", "Qual meu saldo atual?");
    expect(balanceReply).toContain("R$ 0,00");
  });
});
