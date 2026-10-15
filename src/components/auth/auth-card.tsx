"use client";

import Image from "next/image";
import { useState } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthCardProps {
  onSuccess: (user: AuthUser) => void;
  onContinueGuest?: () => void;
}

export function AuthCard({ onSuccess, onContinueGuest }: AuthCardProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, name: name.trim() || undefined };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro. Tente novamente.");
      }

      onSuccess(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        {/* Header da Logo e Título */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/70 p-2 shadow-xl shadow-emerald-500/10">
            <Image
              src="/logo-icon.png"
              alt="Logo ZUCK"
              width={64}
              height={64}
              priority
              className="h-full w-full object-contain drop-shadow-[0_4px_16px_rgba(56,189,248,0.25)]"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            {mode === "login" ? "Acesse sua conta no ZUCK" : "Crie sua conta no ZUCK"}
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Seu copiloto financeiro com inteligência artificial e persistência em nuvem
          </p>
        </div>

        {/* Abas Alternadoras: Entrar vs Cadastrar */}
        <div className="mb-6 grid grid-cols-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`rounded-lg py-2 transition-all ${
              mode === "login"
                ? "bg-emerald-500 text-zinc-950 shadow-xs shadow-emerald-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`rounded-lg py-2 transition-all ${
              mode === "register"
                ? "bg-emerald-500 text-zinc-950 shadow-xs shadow-emerald-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400"
          >
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-medium text-zinc-300"
              >
                Nome ou apelido (opcional)
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-base sm:text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium text-zinc-300"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-base sm:text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium text-zinc-300"
            >
              Senha {mode === "register" && "(mínimo 6 dígitos)"}
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-base sm:text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[46px] cursor-pointer rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-zinc-950 shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent"></span>
                Processando...
              </span>
            ) : mode === "login" ? (
              "Entrar na conta"
            ) : (
              "Criar minha conta"
            )}
          </button>
        </form>

        {onContinueGuest && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onContinueGuest}
              className="text-xs text-zinc-500 hover:text-zinc-400 hover:underline"
            >
              Ou continuar no modo visitante (dados locais temporários)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
