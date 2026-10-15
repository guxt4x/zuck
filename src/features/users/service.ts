import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

/**
 * Garante que o registro do usuário exista no banco relacional
 * para preservar a integridade referencial de chaves estrangeiras.
 */
export async function ensureUserExists(
  userId: string,
  dbClient?: ReturnType<typeof getDb>
): Promise<void> {
  if (!userId || !userId.trim()) return;

  try {
    const db = dbClient ?? getDb();
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existing) {
      await db
        .insert(users)
        .values({
          id: userId,
          email: `${userId}@zuck.local`,
          name: "Usuário ZUCK",
        })
        .onConflictDoNothing();
    }
  } catch {
    // Não trava o fluxo se o banco não estiver acessível no momento
  }
}
