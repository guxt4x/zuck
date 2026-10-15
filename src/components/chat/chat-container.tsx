"use client";

import { useState } from "react";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import type { ChatMessage } from "./types";

interface ChatContainerProps {
  onActionCompleted?: () => void;
  externalInput?: string;
}

export function ChatContainer({
  onActionCompleted,
  externalInput,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prevExternalInput, setPrevExternalInput] = useState(externalInput);

  if (externalInput !== prevExternalInput) {
    setPrevExternalInput(externalInput);
    if (externalInput) {
      setInput(externalInput);
    }
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta do assistente (${response.status})`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || "Mensagem processada.",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Notifica o painel para sincronizar novos gastos ou metas em tempo real
      if (onActionCompleted) {
        onActionCompleted();
      }
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          err instanceof Error
            ? `⚠️ Não foi possível processar: ${err.message}`
            : "⚠️ Ocorreu um erro inesperado ao conectar com o servidor.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        onSelectQuickPrompt={handleSelectQuickPrompt}
      />
      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSubmit={() => sendMessage(input)}
      />
    </div>
  );
}
