import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { getDb } from "@/db";
import { sessions, users } from "@/db/schema";
import { logger } from "@/lib/logger";
import {
  deleteMemorySession,
  getMemorySessionByToken,
  getMemoryUserByEmail,
  getMemoryUserById,
  saveMemorySession,
  saveMemoryUser,
} from "../store/memory-store";
import { hashPassword, verifyPassword } from "./password";
import { loginSchema, registerSchema } from "./schemas";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
  expiresAt: Date;
}

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function registerUser(
  rawInput: unknown,
  dbClient?: ReturnType<typeof getDb>
): Promise<AuthResult> {
  const input = registerSchema.parse(rawInput);
  const passwordHash = hashPassword(input.password);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = generateSessionToken();

  try {
    const db = dbClient ?? getDb();
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existing?.passwordHash) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    let authUser: AuthUser;

    if (existing) {
      const [updated] = await db
        .update(users)
        .set({
          passwordHash,
          name: input.name ?? existing.name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();

      authUser = { id: updated.id, email: updated.email, name: updated.name };
    } else {
      const newUserId = `usr_${randomBytes(8).toString("hex")}`;
      const [created] = await db
        .insert(users)
        .values({
          id: newUserId,
          email: input.email,
          name: input.name ?? null,
          passwordHash,
        })
        .returning();

      authUser = { id: created.id, email: created.email, name: created.name };
    }

    await db.insert(sessions).values({
      userId: authUser.id,
      token,
      expiresAt,
    });

    return { user: authUser, token, expiresAt };
  } catch (err) {
    if (err instanceof Error && err.message === "Este e-mail já está cadastrado.") {
      throw err;
    }
    logger.warn({ error: err }, "Database unavailable during register, using memory store fallback");

    const existingMemory = getMemoryUserByEmail(input.email);
    if (existingMemory?.passwordHash) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    const userId = existingMemory ? existingMemory.id : `usr_${randomBytes(8).toString("hex")}`;
    const now = new Date();
    const memoryUser = saveMemoryUser({
      id: userId,
      email: input.email,
      name: input.name ?? existingMemory?.name ?? null,
      passwordHash,
      createdAt: existingMemory?.createdAt ?? now,
      updatedAt: now,
    });

    saveMemorySession({
      id: `sess_${randomBytes(8).toString("hex")}`,
      userId,
      token,
      expiresAt,
      createdAt: now,
    });

    return {
      user: { id: memoryUser.id, email: memoryUser.email, name: memoryUser.name ?? null },
      token,
      expiresAt,
    };
  }
}

export async function loginUser(
  rawInput: unknown,
  dbClient?: ReturnType<typeof getDb>
): Promise<AuthResult> {
  const input = loginSchema.parse(rawInput);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = generateSessionToken();

  try {
    const db = dbClient ?? getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user || !user.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
      throw new Error("E-mail ou senha incorretos.");
    }

    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
      expiresAt,
    };
  } catch (err) {
    if (err instanceof Error && err.message === "E-mail ou senha incorretos.") {
      throw err;
    }
    logger.warn({ error: err }, "Database unavailable during login, using memory store fallback");

    const memoryUser = getMemoryUserByEmail(input.email);
    if (!memoryUser || !memoryUser.passwordHash || !verifyPassword(input.password, memoryUser.passwordHash)) {
      throw new Error("E-mail ou senha incorretos.");
    }

    saveMemorySession({
      id: `sess_${randomBytes(8).toString("hex")}`,
      userId: memoryUser.id,
      token,
      expiresAt,
      createdAt: new Date(),
    });

    return {
      user: { id: memoryUser.id, email: memoryUser.email, name: memoryUser.name ?? null },
      token,
      expiresAt,
    };
  }
}

export async function validateSessionToken(
  token: string,
  dbClient?: ReturnType<typeof getDb>
): Promise<{ user: AuthUser; expiresAt: Date } | null> {
  if (!token || !token.trim()) return null;

  try {
    const db = dbClient ?? getDb();
    const [result] = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!result) return null;

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      expiresAt: result.session.expiresAt,
    };
  } catch {
    const memorySession = getMemorySessionByToken(token);
    if (!memorySession) return null;

    const memoryUser = getMemoryUserById(memorySession.userId);
    if (!memoryUser) return null;

    return {
      user: {
        id: memoryUser.id,
        email: memoryUser.email,
        name: memoryUser.name ?? null,
      },
      expiresAt: memorySession.expiresAt,
    };
  }
}

export async function logoutUser(
  token: string,
  dbClient?: ReturnType<typeof getDb>
): Promise<void> {
  if (!token) return;

  try {
    const db = dbClient ?? getDb();
    await db.delete(sessions).where(eq(sessions.token, token));
  } catch {
    deleteMemorySession(token);
  }
}
