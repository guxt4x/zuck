import type { DashboardTransaction } from "./types";

interface RecentTransactionsProps {
  transactions: DashboardTransaction[];
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

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Últimas Movimentações
        </h3>
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <span className="text-3xl">🧾</span>
          <p className="mt-2 text-sm text-zinc-300">Nenhuma movimentação registrada</p>
          <p className="mt-1 max-w-xs text-xs text-zinc-500">
            Experimente dizer no chat: &quot;Recebi 3500 de salário&quot; ou &quot;Gastei 50 no almoço&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Últimas Movimentações
        </h3>
        <span className="rounded-lg bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-400">
          {transactions.length} registradas
        </span>
      </div>

      <div className="divide-y divide-zinc-800/60">
        {transactions.map((tx) => {
          const isIncome = tx.type === "income";
          const icon = CATEGORY_ICONS[tx.categorySlug] || "🏷️";
          const dateStr =
            typeof tx.date === "string"
              ? new Date(tx.date).toLocaleDateString("pt-BR")
              : tx.date.toLocaleDateString("pt-BR");

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 transition-colors hover:bg-zinc-800/30 px-2 rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-base">
                  {icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">
                    {tx.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>{tx.categoryName}</span>
                    <span>•</span>
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>

              <div
                className={`text-right text-sm font-semibold ${
                  isIncome ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isIncome ? "+ " : "- "}
                {tx.formattedAmount}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
