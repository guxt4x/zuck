import type { CategoryExpenseItem } from "./types";

interface CategoryBreakdownProps {
  categories: CategoryExpenseItem[];
  topCategory: CategoryExpenseItem | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  alimentacao: "🍔",
  transporte: "🚗",
  moradia: "🏠",
  lazer: "🎉",
  saude: "💊",
  compras: "🛍️",
  educacao: "📚",
  contas: "📄",
  outros: "📦",
};

export function CategoryBreakdown({
  categories,
  topCategory,
}: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Gastos por Categoria
        </h3>
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <span className="text-3xl">📊</span>
          <p className="mt-2 text-sm text-zinc-300">Nenhuma despesa registrada ainda</p>
          <p className="mt-1 max-w-xs text-xs text-zinc-500">
            Diga ao ZUCK no chat: &quot;Gastei 45 no mercado&quot; para ver seus gastos categorizados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Gastos por Categoria
          </h3>
          {topCategory && (
            <p className="mt-0.5 text-xs text-emerald-400">
              Maior gasto em <span className="font-semibold">{topCategory.name}</span> ({topCategory.percentage}%)
            </p>
          )}
        </div>
        <span className="rounded-lg bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-400">
          {categories.length} {categories.length === 1 ? "categoria" : "categorias"}
        </span>
      </div>

      <div className="mt-5 space-y-3.5">
        {categories.map((cat) => {
          const icon = CATEGORY_ICONS[cat.slug] || "🏷️";
          return (
            <div key={cat.slug} className="group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="font-medium text-zinc-200">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-100">{cat.formattedTotal}</span>
                  <span className="w-9 text-right text-xs text-zinc-500">{cat.percentage}%</span>
                </div>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-800/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 group-hover:from-emerald-400 group-hover:to-teal-300"
                  style={{ width: `${Math.max(4, cat.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
