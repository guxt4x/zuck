import type { DashboardGoal } from "./types";

interface GoalsTrackerProps {
  goals: DashboardGoal[];
}

export function GoalsTracker({ goals }: GoalsTrackerProps) {
  if (goals.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Metas Financeiras
        </h3>
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <span className="text-3xl">🎯</span>
          <p className="mt-2 text-sm text-zinc-300">Nenhuma meta criada ainda</p>
          <p className="mt-1 max-w-xs text-xs text-zinc-500">
            Diga ao ZUCK: &quot;Cria uma meta de 5000 para viagem em dezembro&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Metas Financeiras
        </h3>
        <span className="rounded-lg bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-400">
          {goals.length} ativas
        </span>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const targetDateStr =
            typeof goal.targetDate === "string"
              ? new Date(goal.targetDate).toLocaleDateString("pt-BR")
              : goal.targetDate.toLocaleDateString("pt-BR");

          return (
            <div
              key={goal.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 transition-all hover:border-emerald-500/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">
                    {goal.title}
                  </h4>
                  <p className="text-xs text-zinc-500">Prazo: {targetDateStr}</p>
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                  {goal.progressPercent}%
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${Math.max(4, goal.progressPercent)}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  {goal.formattedCurrent} de{" "}
                  <span className="text-zinc-200 font-medium">
                    {goal.formattedTarget}
                  </span>
                </span>
                <span className="text-emerald-400/90 font-medium">
                  Guardar {goal.monthlySavings.formattedMonthly}/mês
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
