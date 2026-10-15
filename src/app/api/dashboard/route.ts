import { NextResponse } from "next/server";
import { getPeriodSummary, listTransactions } from "@/features/transactions/service";
import { listGoals } from "@/features/goals/service";
import { resolveUserSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { userId, isNew } = resolveUserSession(req);

    const [summary, transactions, goals] = await Promise.all([
      getPeriodSummary(userId),
      listTransactions(userId),
      listGoals(userId),
    ]);

    const response = NextResponse.json({
      summary,
      transactions,
      goals,
    });

    if (isNew) {
      response.cookies.set(SESSION_COOKIE_NAME, userId, SESSION_COOKIE_OPTIONS);
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar dados do painel financeiro." },
      { status: 500 }
    );
  }
}
