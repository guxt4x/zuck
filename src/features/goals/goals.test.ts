import { describe, expect, it, vi } from "vitest";
import { calculateMonthlySavings, createGoal, listGoals } from "./service";
import { createGoalSchema } from "./schemas";

vi.mock("server-only", () => ({}));

describe("Goals domain calculations", () => {
  it("calcula quanto guardar por mês baseado no prazo e valor alvo", () => {
    const fromDate = new Date("2026-01-01T00:00:00Z");
    const targetDate = new Date("2026-11-01T00:00:00Z"); // 10 meses depois

    // Meta de 5 mil reais (500.000 centavos) com 0 guardados
    const savings = calculateMonthlySavings(500000, 0, targetDate, fromDate);

    expect(savings.remainingCents).toBe(500000);
    expect(savings.monthsRemaining).toBe(10);
    expect(savings.monthlyAmountCents).toBe(50000); // 500 reais por mês
    expect(savings.formattedMonthly).toBe("R$ 500,00");
  });

  it("desconta valor já guardado do cálculo mensal", () => {
    const fromDate = new Date("2026-01-01T00:00:00Z");
    const targetDate = new Date("2026-05-01T00:00:00Z"); // 4 meses depois

    // Meta de R$ 5.000,00, já guardou R$ 1.000,00
    const savings = calculateMonthlySavings(500000, 100000, targetDate, fromDate);

    expect(savings.remainingCents).toBe(400000);
    expect(savings.monthsRemaining).toBe(4);
    expect(savings.monthlyAmountCents).toBe(100000); // 1.000 reais por mês
    expect(savings.formattedMonthly).toBe("R$ 1.000,00");
  });

  it("retorna zero se a meta já foi atingida", () => {
    const fromDate = new Date("2026-01-01T00:00:00Z");
    const targetDate = new Date("2026-12-01T00:00:00Z");

    const savings = calculateMonthlySavings(500000, 550000, targetDate, fromDate);

    expect(savings.remainingCents).toBe(0);
    expect(savings.monthlyAmountCents).toBe(0);
  });
});

describe("Goals schema validation", () => {
  it("valida criação de meta com conversão de valor", () => {
    const parsed = createGoalSchema.parse({
      title: "Viagem de férias",
      targetAmount: "5000",
      targetDate: "2026-12-31",
    });

    expect(parsed.title).toBe("Viagem de férias");
    expect(parsed.targetAmount).toBe(500000);
    expect(parsed.currentAmount).toBe(0);
    expect(parsed.targetDate).toBeInstanceOf(Date);
  });

  it("rejeita título vazio", () => {
    expect(() =>
      createGoalSchema.parse({
        title: "",
        targetAmount: 500,
        targetDate: "2026-12-31",
      })
    ).toThrow();
  });
});

describe("Goals service authentication and isolation", () => {
  it("exige userId autenticado", async () => {
    await expect(
      createGoal("", {
        title: "Reserva",
        targetAmount: 1000,
        targetDate: "2026-12-31",
      })
    ).rejects.toThrow("Usuário não autenticado.");

    await expect(listGoals("")).rejects.toThrow("Usuário não autenticado.");
  });

  it("salva meta filtrada pelo userId do usuário", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([
        {
          id: "goal-1",
          userId: "user-123",
          title: "Reserva de emergência",
          targetAmountCents: 1000000,
          currentAmountCents: 200000,
          targetDate: new Date("2026-12-31"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    };

    const result = await createGoal(
      "user-123",
      {
        title: "Reserva de emergência",
        targetAmount: 10000,
        targetDate: "2026-12-31",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDb as any
    );

    expect(result.userId).toBe("user-123");
    expect(result.formattedTarget).toBe("R$ 10.000,00");
    expect(mockDb.insert).toHaveBeenCalled();
  });
});
