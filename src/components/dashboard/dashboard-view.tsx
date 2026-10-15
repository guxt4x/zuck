"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "./types";
import { MetricCards } from "./metric-cards";
import { CategoryBreakdown } from "./category-breakdown";
import { RecentTransactions } from "./recent-transactions";
import { GoalsTracker } from "./goals-tracker";

interface DashboardViewProps {
  onSelectPrompt?: (prompt: string) => void;
  refreshTrigger?: number;
}

export function DashboardView({
  onSelectPrompt,
  refreshTrigger = 0,
}: DashboardViewProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Erro ao carregar dados do painel");
        const json = await res.json();
        if (!ignore) {
          setData(json);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Erro ao carregar dados do painel");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-1 flex-col space-y-4 p-6">
        <div className="h-28 animate-pulse rounded-2xl bg-zinc-900/60" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-900/60" />
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-900/60" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-rose-400">{error || "Não foi possível carregar os dados"}</p>
        <button
          onClick={handleManualRefresh}
          className="mt-3 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-100 hover:bg-zinc-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-4 sm:space-y-6 overflow-y-auto p-3.5 sm:p-6 pb-24 sm:pb-8">
      {/* Top Bar do Dashboard */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2 truncate">
            Visão Geral Financeira
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
            Dados sincronizados em tempo real com as interações do assistente
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          title="Atualizar painel"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 sm:px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400 active:scale-95"
        >
          <svg
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden xs:inline sm:inline">Atualizar</span>
        </button>
      </div>

      {/* Cartões de Indicadores Chave */}
      <MetricCards summary={data.summary} />

      {/* Grid Principal: Categorias e Últimas Movimentações */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryBreakdown
          categories={data.summary.categories}
          topCategory={data.summary.topCategory}
        />
        <RecentTransactions transactions={data.transactions} />
      </div>

      {/* Metas Financeiras */}
      <GoalsTracker goals={data.goals} />

      {/* Ações Rápidas integradas ao Chat */}
      {onSelectPrompt && (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
            Ações Rápidas com o ZUCK:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Gastei 45 no almoço",
              "Recebi 3500 de salário",
              "Cria uma meta de 5000 para viagem",
              "Quanto gastei esse mês?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => onSelectPrompt(prompt)}
                className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                + {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
