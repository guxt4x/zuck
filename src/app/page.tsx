"use client";

import { useEffect, useState } from "react";
import { AuthCard, type AuthUser } from "@/components/auth/auth-card";
import { ChatContainer } from "@/components/chat/chat-container";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat">("dashboard");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [chatPrompt, setChatPrompt] = useState("");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch {
        // Modo offline ou erro de rede
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  const handleActionCompleted = () => {
    // Sincroniza o dashboard imediatamente quando o bot registra uma ação
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectPromptFromDashboard = (prompt: string) => {
    setChatPrompt(prompt);
    setActiveTab("chat");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignora erro de rede no logout
    }
    setCurrentUser(null);
    setIsGuest(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          <span className="text-xs font-medium tracking-wide">Iniciando ZUCK...</span>
        </div>
      </div>
    );
  }

  if (!currentUser && !isGuest) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <AuthCard
          onSuccess={(user) => {
            setCurrentUser(user);
            setRefreshTrigger((prev) => prev + 1);
          }}
          onContinueGuest={() => setIsGuest(true)}
        />
      </div>
    );
  }

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

        {/* User Profile e Logout */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-zinc-200">
                  {currentUser.name || currentUser.email.split("@")[0]}
                </span>
                <span className="text-[10px] text-emerald-400 truncate max-w-[140px]">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sair da conta"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsGuest(false)}
              className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-zinc-950 shadow-xs shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
            >
              Fazer login
            </button>
          )}
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
