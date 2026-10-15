import "server-only";
import { DEFAULT_CATEGORIES } from "@/db/schema/categories";

export interface StoredTransaction {
  id: string;
  userId: string;
  type: "expense" | "income" | "transfer";
  amountCents: number;
  description: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  date: Date;
  createdAt: Date;
}

export interface StoredGoal {
  id: string;
  userId: string;
  title: string;
  targetAmountCents: number;
  currentAmountCents: number;
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Armazenamento em memória com isolamento estrito por usuário (fallback seguro)
const globals = globalThis as typeof globalThis & {
  __zuckMemoryTransactions?: Map<string, StoredTransaction[]>;
  __zuckMemoryGoals?: Map<string, StoredGoal[]>;
};

if (!globals.__zuckMemoryTransactions) {
  globals.__zuckMemoryTransactions = new Map();
}
if (!globals.__zuckMemoryGoals) {
  globals.__zuckMemoryGoals = new Map();
}

const transactionsMap = globals.__zuckMemoryTransactions;
const goalsMap = globals.__zuckMemoryGoals;

export function getMemoryTransactions(userId: string): StoredTransaction[] {
  return transactionsMap.get(userId) || [];
}

export function saveMemoryTransaction(
  userId: string,
  tx: Omit<StoredTransaction, "id" | "createdAt" | "categoryName">
): StoredTransaction {
  const current = transactionsMap.get(userId) || [];
  const categoryDef = DEFAULT_CATEGORIES.find((c) => c.slug === tx.categorySlug);
  const categoryName = categoryDef ? categoryDef.name : tx.categorySlug;

  const newTx: StoredTransaction = {
    ...tx,
    id: `tx_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    categoryName,
    createdAt: new Date(),
  };

  transactionsMap.set(userId, [newTx, ...current]);
  return newTx;
}

export function deleteMemoryTransaction(userId: string, transactionId: string): StoredTransaction | null {
  const current = transactionsMap.get(userId) || [];
  const index = current.findIndex((t) => t.id === transactionId);
  if (index === -1) return null;

  const [removed] = current.splice(index, 1);
  transactionsMap.set(userId, current);
  return removed;
}

export function getMemoryGoals(userId: string): StoredGoal[] {
  return goalsMap.get(userId) || [];
}

export function saveMemoryGoal(
  userId: string,
  goal: Omit<StoredGoal, "id" | "createdAt" | "updatedAt">
): StoredGoal {
  const current = goalsMap.get(userId) || [];
  const now = new Date();
  const newGoal: StoredGoal = {
    ...goal,
    id: `goal_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    createdAt: now,
    updatedAt: now,
  };

  goalsMap.set(userId, [...current, newGoal]);
  return newGoal;
}

export function updateMemoryGoal(
  userId: string,
  goalId: string,
  updates: { currentAmountCents?: number; addedAmountCents?: number }
): StoredGoal | null {
  const current = goalsMap.get(userId) || [];
  const target = current.find((g) => g.id === goalId);
  if (!target) return null;

  if (updates.currentAmountCents !== undefined) {
    target.currentAmountCents = updates.currentAmountCents;
  } else if (updates.addedAmountCents !== undefined) {
    target.currentAmountCents += updates.addedAmountCents;
  }
  target.updatedAt = new Date();

  return target;
}
