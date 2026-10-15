import { type FormEvent, type KeyboardEvent, useEffect, useRef } from "react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (val: string) => void;
  onSubmit: () => void;
}

export function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restaura o foco automaticamente após a resposta do assistente
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-zinc-200/80 bg-white/80 p-3 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/80"
    >
      <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-zinc-300 bg-white p-1.5 shadow-xs transition-colors focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-within:border-emerald-500/80 dark:focus-within:ring-emerald-500/20">
        <label htmlFor="chat-message-input" className="sr-only">
          Mensagem para o assistente
        </label>
        <textarea
          id="chat-message-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Gastei 45 reais no mercado..."
          rows={1}
          readOnly={isLoading}
          aria-disabled={isLoading}
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-hidden disabled:opacity-50 dark:text-zinc-100 dark:placeholder-zinc-500"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          aria-label="Enviar mensagem"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 disabled:pointer-events-none disabled:opacity-30 dark:bg-emerald-400 dark:text-zinc-950 dark:hover:bg-emerald-300 shadow-sm shadow-emerald-500/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 004.835 9.25h8.415a.75.75 0 010 1.5H4.835a1.5 1.5 0 00-1.142 1.086L2.279 16.76a.75.75 0 00.95.826l15.5-5.5a.75.75 0 000-1.414l-15.5-5.5z" />
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        O ZUCK calcula seus valores de forma determinística no servidor.
      </p>
    </form>
  );
}
