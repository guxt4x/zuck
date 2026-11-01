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

export interface StoredUser {
  id: string;
  name?: string | null;
  email: string;
  passwordHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Armazenamento em memória com isolamento estrito por usuário (fallback seguro)
const globals = globalThis as typeof globalThis & {
  __zuckMemoryTransactions?: Map<string, StoredTransaction[]>;
  __zuckMemoryGoals?: Map<string, StoredGoal[]>;
  __zuckMemoryUsers?: Map<string, StoredUser>;
  __zuckMemorySessions?: Map<string, StoredSession>;
};

if (!globals.__zuckMemoryTransactions) {
  globals.__zuckMemoryTransactions = new Map();
}
if (!globals.__zuckMemoryGoals) {
  globals.__zuckMemoryGoals = new Map();
}
if (!globals.__zuckMemoryUsers) {
  globals.__zuckMemoryUsers = new Map();
}
if (!globals.__zuckMemorySessions) {
  globals.__zuckMemorySessions = new Map();
}

const transactionsMap = globals.__zuckMemoryTransactions;
const goalsMap = globals.__zuckMemoryGoals;
const usersMap = globals.__zuckMemoryUsers;
const sessionsMap = globals.__zuckMemorySessions;

export function getMemoryUserByEmail(email: string): StoredUser | null {
  const normalized = email.toLowerCase().trim();
  for (const user of usersMap.values()) {
    if (user.email.toLowerCase().trim() === normalized) {
      return user;
    }
  }
  return null;
}

export function getMemoryUserById(id: string): StoredUser | null {
  return usersMap.get(id) || null;
}

export function saveMemoryUser(user: StoredUser): StoredUser {
  usersMap.set(user.id, user);
  return user;
}

export function saveMemorySession(session: StoredSession): StoredSession {
  sessionsMap.set(session.token, session);
  return session;
}

export function getMemorySessionByToken(token: string): StoredSession | null {
  const session = sessionsMap.get(token);
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    sessionsMap.delete(token);
    return null;
  }
  return session;
}

export function deleteMemorySession(token: string): boolean {
  return sessionsMap.delete(token);
}


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

export function clearMemoryTransactions(userId: string): number {
  const current = transactionsMap.get(userId) || [];
  const count = current.length;
  transactionsMap.set(userId, []);
  return count;
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

export function clearMemoryGoals(userId: string): number {
  const current = goalsMap.get(userId) || [];
  const count = current.length;
  goalsMap.set(userId, []);
  return count;
}
