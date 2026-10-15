import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/dashboard", () => {
  it("retorna o sumário, lista de transações e metas do usuário autenticado", async () => {
    const req = new Request("http://localhost:3000/api/dashboard", {
      method: "GET",
      headers: {
        cookie: "zuck_session_id=usr_test_dashboard_user",
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty("summary");
    expect(json).toHaveProperty("transactions");
    expect(json).toHaveProperty("goals");

    expect(json.summary).toHaveProperty("formattedBalance");
    expect(json.summary).toHaveProperty("formattedIncome");
    expect(json.summary).toHaveProperty("formattedExpense");
    expect(Array.isArray(json.transactions)).toBe(true);
    expect(Array.isArray(json.goals)).toBe(true);
  });
});
