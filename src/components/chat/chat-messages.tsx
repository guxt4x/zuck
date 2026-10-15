import { useEffect, useRef } from "react";
import type { ChatMessage, QuickPrompt } from "./types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectQuickPrompt: (prompt: string) => void;
}

const DEFAULT_QUICK_PROMPTS: QuickPrompt[] = [
  { id: "1", label: "🍔 Registrar almoço", prompt: "Gastei 35 reais no almoço" },
  { id: "2", label: "💼 Registrar salário", prompt: "Recebi 2500 de salário" },
  { id: "3", label: "💰 Consultar saldo", prompt: "Quanto tenho disponível?" },
  { id: "4", label: "🎯 Criar meta", prompt: "Cria uma meta de 5000 para viagem em dezembro" },
];

export function ChatMessages({
  messages,
  isLoading,
  onSelectQuickPrompt,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 font-black text-2xl text-zinc-950 shadow-lg shadow-emerald-500/20">
          Z
        </div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          Olá! Eu sou o ZUCK
        </h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-400">
          Seu copiloto financeiro conversacional. Registre despesas, receitas ou consulte seu saldo falando naturalmente.
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
            Experimente perguntar:
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DEFAULT_QUICK_PROMPTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectQuickPrompt(item.prompt)}
                className="flex items-center justify-start rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-left text-xs font-medium text-zinc-200 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col space-y-4 overflow-y-auto px-4 py-6"
      aria-live="polite"
      aria-label="Histórico de mensagens"
    >
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs sm:max-w-[75%] ${
                isUser
                  ? "bg-emerald-500 text-zinc-950 font-medium"
                  : "border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-sm"
              }`}
            >
              {!isUser && (
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-zinc-950">
                    Z
                  </span>
                  ZUCK
                </div>
              )}
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"></span>
            <span className="ml-1 text-xs font-medium text-emerald-400/90">ZUCK calculando no servidor...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
