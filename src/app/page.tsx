"use client";

import { useState } from "react";
import { ChatContainer } from "@/components/chat/chat-container";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat">("dashboard");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [chatPrompt, setChatPrompt] = useState("");

  const handleActionCompleted = () => {
    // Sincroniza o dashboard imediatamente quando o bot registra uma ação
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectPromptFromDashboard = (prompt: string) => {
    setChatPrompt(prompt);
    setActiveTab("chat");
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Top Header Moderno */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 font-black text-sm text-zinc-950 shadow-md shadow-emerald-500/20">
            Z
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-zinc-100">
                ZUCK
              </h1>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Copiloto
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Controle financeiro inteligente e conversacional
            </p>
          </div>
        </div>

        {/* Alternador de Visualização (Dashboard / Chat) */}
        <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/90 p-0.5 text-xs font-medium">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === "dashboard"
                ? "bg-emerald-500 text-zinc-950 font-bold shadow-xs shadow-emerald-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>📊 Painel</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === "chat"
                ? "bg-emerald-500 text-zinc-950 font-bold shadow-xs shadow-emerald-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>💬 Chat com ZUCK</span>
          </button>
        </div>

        {/* Status Badge */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex flex-1 overflow-hidden">
        {activeTab === "dashboard" ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            <DashboardView
              refreshTrigger={refreshTrigger}
              onSelectPrompt={handleSelectPromptFromDashboard}
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <ChatContainer
              onActionCompleted={handleActionCompleted}
              externalInput={chatPrompt}
            />
          </div>
        )}
      </main>
    </div>
  );
}
