import type { DashboardSummary } from "./types";

interface MetricCardsProps {
  summary: DashboardSummary;
}

export function MetricCards({ summary }: MetricCardsProps) {
  const isPositiveBalance = summary.balanceCents >= 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Card 1: Saldo Disponível */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 backdrop-blur-md transition-all hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Saldo Disponível
          </span>
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
              isPositiveBalance
                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"
            }`}
          >
            {isPositiveBalance ? "✓" : "!"}
          </span>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl font-bold tracking-tight sm:text-3xl ${
              isPositiveBalance ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {summary.formattedBalance}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Calculado determinísticamente em tempo real
          </p>
        </div>
      </div>

      {/* Card 2: Total de Receitas */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 backdrop-blur-md transition-all hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Entradas / Receitas
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            {summary.formattedIncome}
          </div>
          <p className="mt-1 text-xs text-emerald-500/90 font-medium">
            + Total acumulado de entradas
          </p>
        </div>
      </div>

      {/* Card 3: Total de Despesas */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 backdrop-blur-md transition-all hover:border-rose-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Saídas / Despesas
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            {summary.formattedExpense}
          </div>
          <p className="mt-1 text-xs text-rose-400/90 font-medium">
            - Total de gastos registrados
          </p>
        </div>
      </div>
    </div>
  );
}
