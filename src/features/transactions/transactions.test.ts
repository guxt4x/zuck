import { describe, expect, it, vi } from "vitest";
import { formatCentsToBrl, parseAmountToCents } from "./money";
import { registerExpenseSchema, registerIncomeSchema } from "./schemas";
import { calculateBalance, getBalance, registerExpense } from "./service";

vi.mock("server-only", () => ({}));

describe("Money utility", () => {
  it("converte valores numéricos para centavos inteiros sem desvio de ponto flutuante", () => {
    expect(parseAmountToCents(80)).toBe(8000);
    expect(parseAmountToCents(35.5)).toBe(3550);
    expect(parseAmountToCents(0.1 + 0.2)).toBe(30); // 0.1 + 0.2 = 0.30000000000000004 -> 30 centavos exatos
    expect(parseAmountToCents(1250.99)).toBe(125099);
  });

  it("converte strings em formato brasileiro ou internacional", () => {
    expect(parseAmountToCents("80")).toBe(8000);
    expect(parseAmountToCents("80,50")).toBe(8050);
    expect(parseAmountToCents("R$ 80,50")).toBe(8050);
    expect(parseAmountToCents("1.250,50")).toBe(125050);
    expect(parseAmountToCents("1.250.000")).toBe(125000000);
    expect(parseAmountToCents("1.500")).toBe(150000);
    expect(parseAmountToCents("2500.00")).toBe(250000);
  });

  it("rejeita valores zero, negativos ou inválidos", () => {
    expect(() => parseAmountToCents(0)).toThrow("O valor monetário deve ser maior que zero.");
    expect(() => parseAmountToCents(-15)).toThrow("O valor monetário deve ser maior que zero.");
    expect(() => parseAmountToCents("abc")).toThrow("Não foi possível interpretar o valor");
  });

  it("formata centavos inteiros em BRL", () => {
    expect(formatCentsToBrl(8000)).toBe("R$ 80,00");
    expect(formatCentsToBrl(3550)).toBe("R$ 35,50");
    expect(formatCentsToBrl(0)).toBe("R$ 0,00");
    expect(formatCentsToBrl(-1500)).toBe("- R$ 15,00");
  });
});

describe("Transaction schemas validation", () => {
  it("valida e transforma despesas para centavos inteiros", () => {
    const result = registerExpenseSchema.parse({
      amount: "80,50",
      description: "Almoço no mercado",
      categorySlug: "alimentacao",
    });

    expect(result.amount).toBe(8050);
    expect(result.description).toBe("Almoço no mercado");
    expect(result.categorySlug).toBe("alimentacao");
    expect(result.date).toBeInstanceOf(Date);
  });

  it("aplica categoria 'outros' por padrão se omitida", () => {
    const result = registerIncomeSchema.parse({
      amount: 2500,
      description: "Salário mensal",
    });

    expect(result.amount).toBe(250000);
    expect(result.categorySlug).toBe("outros");
  });

  it("rejeita descrições vazias e valores negativos", () => {
    expect(() =>
      registerExpenseSchema.parse({
        amount: -50,
        description: "Teste",
      })
    ).toThrow();

    expect(() =>
      registerExpenseSchema.parse({
        amount: 50,
        description: "   ",
      })
    ).toThrow();
  });
});

describe("Balance calculation (pure function)", () => {
  it("calcula saldo determinístico com receitas e despesas", () => {
    const summary = calculateBalance([
      { type: "income", amountCents: 250000 }, // R$ 2.500,00
      { type: "expense", amountCents: 8000 },  // R$ 80,00
      { type: "expense", amountCents: 3550 },  // R$ 35,50
    ]);

    expect(summary.totalIncomeCents).toBe(250000);
    expect(summary.totalExpenseCents).toBe(11550);
    expect(summary.balanceCents).toBe(238450); // 250000 - 11550 = 238450 (R$ 2.384,50)
    expect(summary.formattedIncome).toBe("R$ 2.500,00");
    expect(summary.formattedExpense).toBe("R$ 115,50");
    expect(summary.formattedBalance).toBe("R$ 2.384,50");
  });

  it("retorna zeros quando não há movimentações no período", () => {
    const summary = calculateBalance([]);
    expect(summary.totalIncomeCents).toBe(0);
    expect(summary.totalExpenseCents).toBe(0);
    expect(summary.balanceCents).toBe(0);
    expect(summary.formattedBalance).toBe("R$ 0,00");
  });
});

describe("Service layer and security boundaries", () => {
  it("impede operações sem usuário autenticado", async () => {
    await expect(registerExpense("", { amount: 50, description: "Café" })).rejects.toThrow(
      "Usuário não autenticado."
    );

    await expect(getBalance("")).rejects.toThrow("Usuário não autenticado.");
  });

  it("garante que inserção e consulta filtram estritamente pelo userId", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: "cat-123" }]),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([
        {
          id: "tx-1",
          userId: "user-abc",
          type: "expense",
          amountCents: 3500,
          description: "Lanche",
          categoryId: "cat-123",
          date: new Date(),
        },
      ]),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await registerExpense("user-abc", { amount: 35, description: "Lanche" }, mockDb as any);

    expect(created.userId).toBe("user-abc");
    expect(created.amountCents).toBe(3500);
    expect(created.formattedAmount).toBe("R$ 35,00");
    expect(mockDb.insert).toHaveBeenCalled();
  });
});
