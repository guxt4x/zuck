import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { goals } from "@/db/schema";
import { formatCentsToBrl } from "@/features/transactions/money";
import {
  createGoalSchema,
  updateGoalSchema,
} from "./schemas";
import {
  clearMemoryGoals,
  getMemoryGoals,
  saveMemoryGoal,
  updateMemoryGoal,
} from "../store/memory-store";

export function calculateMonthlySavings(
  targetAmountCents: number,
  currentAmountCents: number,
  targetDate: Date,
  fromDate = new Date()
): {
  remainingCents: number;
  monthsRemaining: number;
  monthlyAmountCents: number;
  formattedMonthly: string;
} {
  const remainingCents = Math.max(0, targetAmountCents - currentAmountCents);

  const yearDiff = targetDate.getFullYear() - fromDate.getFullYear();
  const monthDiff = targetDate.getMonth() - fromDate.getMonth();
  const totalMonths = Math.max(1, yearDiff * 12 + monthDiff);

  const monthlyAmountCents = Math.ceil(remainingCents / totalMonths);

  return {
    remainingCents,
    monthsRemaining: totalMonths,
    monthlyAmountCents,
    formattedMonthly: formatCentsToBrl(monthlyAmountCents),
  };
}

function formatGoal(goal: {
  id: string;
  userId: string;
  title: string;
  targetAmountCents: number;
  currentAmountCents: number;
  targetDate: Date;
}) {
  const savings = calculateMonthlySavings(
    goal.targetAmountCents,
    goal.currentAmountCents,
    goal.targetDate
  );
  const progressPercent = Math.min(
    100,
    Math.round((goal.currentAmountCents / goal.targetAmountCents) * 100)
  );

  return {
    ...goal,
    progressPercent,
    formattedTarget: formatCentsToBrl(goal.targetAmountCents),
    formattedCurrent: formatCentsToBrl(goal.currentAmountCents),
    monthlySavings: savings,
  };
}

export async function createGoal(
  userId: string,
  rawInput: unknown,
  dbClient?: ReturnType<typeof getDb>
) {
  if (!userId || !userId.trim()) throw new Error("Usuário não autenticado.");
  const input = createGoalSchema.parse(rawInput);

  try {
    const db = dbClient ?? getDb();
    const [goal] = await db
      .insert(goals)
      .values({
        userId,
        title: input.title,
        targetAmountCents: input.targetAmount,
        currentAmountCents: input.currentAmount,
        targetDate: input.targetDate,
      })
      .returning();

    return formatGoal(goal);
  } catch {
    const memoryGoal = saveMemoryGoal(userId, {
      userId,
      title: input.title,
      targetAmountCents: input.targetAmount,
      currentAmountCents: input.currentAmount,
      targetDate: input.targetDate,
    });
    return formatGoal(memoryGoal);
  }
}

export async function listGoals(
  userId: string,
  dbClient?: ReturnType<typeof getDb>
) {
  if (!userId || !userId.trim()) throw new Error("Usuário não autenticado.");

  try {
    const db = dbClient ?? getDb();
    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId));

    return userGoals.map(formatGoal);
  } catch {
    const userGoals = getMemoryGoals(userId);
    return userGoals.map(formatGoal);
  }
}

export async function updateGoal(
  userId: string,
  rawInput: unknown,
  dbClient?: ReturnType<typeof getDb>
) {
  if (!userId || !userId.trim()) throw new Error("Usuário não autenticado.");
  const input = updateGoalSchema.parse(rawInput);

  try {
    const db = dbClient ?? getDb();
    const [existing] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, input.goalId), eq(goals.userId, userId)))
      .limit(1);

    if (!existing) throw new Error("Meta não encontrada.");

    let newCurrentCents = existing.currentAmountCents;
    if (input.currentAmount !== undefined) {
      newCurrentCents = input.currentAmount;
    } else if (input.addedAmount !== undefined) {
      newCurrentCents += input.addedAmount;
    }

    const [updated] = await db
      .update(goals)
      .set({ currentAmountCents: newCurrentCents, updatedAt: new Date() })
      .where(and(eq(goals.id, input.goalId), eq(goals.userId, userId)))
      .returning();

    return formatGoal(updated);
  } catch (err) {
    if (err instanceof Error && err.message === "Meta não encontrada.") throw err;
    const updated = updateMemoryGoal(userId, input.goalId, {
      currentAmountCents: input.currentAmount,
      addedAmountCents: input.addedAmount,
    });
    if (!updated) throw new Error("Meta não encontrada.");
    return formatGoal(updated);
  }
}

export async function clearAllGoals(
  userId: string,
  dbClient?: ReturnType<typeof getDb>
): Promise<number> {
  if (!userId || !userId.trim()) throw new Error("Usuário não autenticado.");

  try {
    const db = dbClient ?? getDb();
    const deleted = await db.delete(goals).where(eq(goals.userId, userId)).returning();
    clearMemoryGoals(userId);
    return deleted.length;
  } catch {
    return clearMemoryGoals(userId);
  }
}
