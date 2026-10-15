import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const DEFAULT_CATEGORIES = [
  { slug: "alimentacao", name: "Alimentação" },
  { slug: "transporte", name: "Transporte" },
  { slug: "moradia", name: "Moradia" },
  { slug: "lazer", name: "Lazer" },
  { slug: "saude", name: "Saúde" },
  { slug: "compras", name: "Compras" },
  { slug: "educacao", name: "Educação" },
  { slug: "contas", name: "Contas" },
  { slug: "outros", name: "Outros" },
] as const;

export type DefaultCategorySlug = (typeof DEFAULT_CATEGORIES)[number]["slug"];

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  isCustom: boolean("is_custom").default(false).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
