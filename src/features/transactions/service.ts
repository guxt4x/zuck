import "server-only";
import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, transactions } from "@/db/schema";
import {
  balanceQuerySchema,
  registerExpenseSchema,
  registerIncomeSchema,
} from "./schemas";
import { formatCentsToBrl } from "./money";
import {
  deleteMemoryTransaction,
  getMemoryTransactions,
  saveMemoryTransaction,
} from "../store/memory-store";

export interface BalanceSummary {
  totalIncomeCents: number;
  totalExpenseCents: number;
  balanceCents: number;
  formattedIncome: string;
  formattedExpense: string;
  formattedBalance: string;
}

export function calculateBalance(
  records: Array<{ type: "expense" | "income" | "transfer"; amountCents: number }>
): BalanceSummary {
  let totalIncomeCents = 0;
  let totalExpenseCents = 0;

  for (const record of records) {
    if (record.type === "income") {
      totalIncomeCents += record.amountCents;
    } else if (record.type === "expense") {
      totalExpenseCents += record.amountCents;
    }
  }

  const balanceCents = totalIncomeCents - totalExpenseCents;
  return {
    totalIncomeCents,
    totalExpenseCents,
    balanceCents,
    formattedIncome: formatCentsToBrl(totalIncomeCents),
    formattedExpense: formatCentsToBrl(totalExpenseCents),
    formattedBalance: formatCentsToBrl(balanceCents),
  };
}

async function resolveCategoryId(
  db: ReturnType<typeof getDb>,
  slug: string,
  userId: string
): Promise<string> {
  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.slug, slug),
        or(isNull(categories.userId), eq(categories.userId, userId))
      )
    )
    .limit(1);

  if (existing?.id) return existing.id;

  const [created] = await db
    .insert(categories)
    .values({
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      isCustom: true,
      userId,
    })
    .returning({ id: categories.id });

  return created.id;
}

export async function registerExpense(
  userId: string,
  rawInput: unknown,
  dbClient?: ReturnType<typeof getDb>
) {
  if (!userId || !userId.trim()) throw new Error("Usuário não autenticado.");
  const input = registerExpenseSchema.parse(rawInput);

  try {
    const db = dbClient ?? getDb();
    const categoryId = await resolveCategoryId(db, input.categorySlug, userId);
    const [tx] = await db
      .insert(transactions)
      .values({
        userId,
        type: "expense",
        amountCents: input.amount,
        description: input.description,
        categoryId,
        date: input.date,
      })
      .returning();

    return { ...tx, formattedAmount: formatCentsToBrl(tx.amountCents) };
  } catch {
    const memoryTx = saveMemoryTransaction(userId, {
      userId,
      type: "expense",
      amountCents: input.amount,
      description: input.description,
      categoryId: input.categorySlug,
      categorySlug: input.categorySlug,
      date: input.date,
    });
    return { ...memoryTx, formattedAmount: formatCentsToBrl(memoryTx.amountCents) };
  }
}

export async function registerIncome(
  userId: string,
  rawInput: unknown,
  dbClient?: ReturnType<typeof getDb>
) {
  if (!userId || !userId.trim()) throw new Error("Usuário não autenticado.");
  const input = registerIncomeSchema.parse(rawInput);

  try {
    const db = dbClient ?? getDb();
    const categoryId = await resolveCategoryId(db, input.categorySlug, userId);
    const [tx] = await db
      .insert(transactions)
      .values({
        userId,
        type: "income",
        amountCents: input.amount,
        description: input.description,
        categoryId,
        date: input.date,
      })
      .returning();

    return { ...tx, formattedAmount: formatCentsToBrl(tx.amountCents) };
  } catch {
    const memoryTx = saveMemoryTransaction(userId, {
      userId,
      type: "income",
      amountCents: input.amount,
      description: input.description,
      categoryId: input.categorySlug,
      categorySlug: input.categorySlug,
      date: input.date,
    });
    return { ...memoryTx, formattedAmount: formatCentsToBrl(memoryTx.amountCents) };
  }
}

export async function getBalance(
  userId: string,
  rawQuery?: unknown,
  dbClient?: ReturnType<typeof getDb>
): Promise<BalanceSummary> {
  if (!userId || !userId.trim()) throw new Error("Usuário não autenticado.");
  const query = balanceQuerySchema.parse(rawQuery || {});

  try {
    const db = dbClient ?? getDb();
    const conditions = [eq(transactions.userId, userId)];
    if (query.startDate) conditions.push(gte(transactions.date, query.startDate));
    if (query.endDate) conditions.push(lte(transactions.date, query.endDate));

    const records = await db
      .select({ type: transactions.type, amountCents: transactions.amountCents })
      .from(transactions)
      .where(and(...conditions));

    return calculateBalance(records);
  } catch {
    const records = getMemoryTransactions(userId).filter((t) => {
      if (query.startDate && t.date < query.startDate) return false;
      if (query.endDate && t.date > query.endDate) return false;
      return true;
    });
    return calculateBalance(records);
  }
}

export async function listTransactions(
  userId: string,
  _rawQuery?: unknown,
  dbClient?: ReturnType<typeof getDb>
) {
  if (!userId || !userId.trim()) throw new Error("Usuário não autenticado.");

  try {
    const db = dbClient ?? getDb();
    const results = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amountCents: transactions.amountCents,
        description: transactions.description,
        date: transactions.date,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .limit(30);

    return results.map((item) => ({
      ...item,
      formattedAmount: formatCentsToBrl(item.amountCents),
    }));
  } catch {
    const results = getMemoryTransactions(userId).slice(0, 30);
    return results.map((item) => ({
      ...item,
      formattedAmount: formatCentsToBrl(item.amountCents),
    }));
  }
}

function summarizeCategoryExpenses(
  expenses: Array<{ amountCents: number; categoryName: string; categorySlug: string }>
) {
  const categoryMap = new Map<string, { name: string; totalCents: number }>();
  let totalAllExpenses = 0;

  for (const item of expenses) {
    totalAllExpenses += item.amountCents;
    const current = categoryMap.get(item.categorySlug) || {
      name: item.categoryName,
      totalCents: 0,
    };
    current.totalCents += item.amountCents;
    categoryMap.set(item.categorySlug, current);
  }

  return Array.from(categoryMap.entries()).map(([slug, data]) => ({
    slug,
    name: data.name,
    totalCents: data.totalCents,
    formattedTotal: formatCentsToBrl(data.totalCents),
    percentage: totalAllExpenses > 0 ? Math.round((data.totalCents / totalAllExpenses) * 100) : 0,
  }));
}

export async function getCategoryExpenses(
  userId: string,
  dbClient?: ReturnType<typeof getDb>
) {
  if (!userId || !userId.trim()) throw new Error("Usuário não autenticado.");

  try {
    const db = dbClient ?? getDb();
    const expenses = await db
      .select({
        amountCents: transactions.amountCents,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "expense")));

    return summarizeCategoryExpenses(expenses);
  } catch {
    const expenses = getMemoryTransactions(userId).filter((t) => t.type === "expense");
    return summarizeCategoryExpenses(expenses);
  }
}

export async function getPeriodSummary(
  userId: string,
  rawQuery?: unknown,
  dbClient?: ReturnType<typeof getDb>
) {
  const balance = await getBalance(userId, rawQuery, dbClient);
  const categoriesExpenses = await getCategoryExpenses(userId, dbClient);
  const topCategory = categoriesExpenses.sort((a, b) => b.totalCents - a.totalCents)[0] || null;

  return { ...balance, topCategory, categories: categoriesExpenses };
}

export async function deleteTransaction(
  userId: string,
  transactionId: string,
  confirmed = false,
  dbClient?: ReturnType<typeof getDb>
) {
  if (!userId || !userId.trim()) throw new Error("Usuário não autenticado.");
  if (!transactionId || !transactionId.trim()) throw new Error("ID da movimentação é obrigatório.");

  if (!confirmed) {
    return {
      status: "confirmation_required",
      message: "⚠️ Confirmação necessária: Tem certeza que deseja apagar esta movimentação?",
      transactionId,
    };
  }

  try {
    const db = dbClient ?? getDb();
    const deleted = await db
      .delete(transactions)
      .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      throw new Error("Movimentação não encontrada ou você não tem permissão para apagá-la.");
    }
    return {
      status: "deleted",
      message: "Movimentação excluída com sucesso.",
      deletedTransaction: deleted[0],
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes("não encontrada")) throw err;
    const removed = deleteMemoryTransaction(userId, transactionId);
    if (!removed) {
      throw new Error("Movimentação não encontrada ou você não tem permissão para apagá-la.");
    }
    return {
      status: "deleted",
      message: "Movimentação excluída com sucesso.",
      deletedTransaction: removed,
    };
  }
}
