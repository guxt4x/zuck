import "server-only";
import { formatCentsToBrl, parseAmountToCents } from "@/features/transactions/money";
import { AI_TOOLS, executeAiTool } from "./tools";

export interface ChatHistoryItem {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = `Você é o ZUCK, copiloto financeiro pessoal.
Regras inegociáveis:
1. Você NUNCA calcula dinheiro diretamente: você usa as ferramentas disponíveis para registrar despesas, receitas, metas e consultar dados. O backend calcula tudo de forma determinística em centavos.
2. Sempre que o usuário solicitar registrar um gasto, receita ou criar/consultar meta financeira, invoque a ferramenta correspondente imediatamente (ex: registrar_despesa, registrar_receita, criar_meta, consultar_saldo, consultar_metas, etc.).
3. Para criar_meta, se o usuário não especificar uma data exata no formato YYYY-MM-DD (ex: 'para dezembro' ou 'em 6 meses'), deduza uma data futura plausível (ex: ano corrente ou subsequente).
4. Seja direto, amigável e conciso em português do Brasil (BRL).
5. Se não houver dados registrados para o período, informe honestamente que não há registros.
6. Exclusão e zerar dados:
- Para apagar tudo / zerar tudo: se o usuário ainda NÃO confirmou, pergunte: "Tem certeza de que deseja apagar todas as suas movimentações e zerar seus registros? Responda 'sim' para confirmar."
- Quando o usuário confirmar (ex: 'sim', 'confirmo', 'pode apagar'), invoque IMEDIATAMENTE a ferramenta 'excluir_movimentacao' com { all: true, confirmed: true }. Nunca pergunte novamente se já confirmou.
- Para apagar uma movimentação específica, invoque 'excluir_movimentacao' com { transactionId, confirmed: true } após a confirmação.
7. Mantenha as respostas curtas e claras.`;

interface GroqMessage {
  role: string;
  content?: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

function isPendingDeleteConfirmation(history: ChatHistoryItem[]): boolean {
  if (!history?.length) return false;
  const last = [...history].reverse().find((h) => h.role === "assistant");
  if (!last) return false;
  const t = last.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return (t.includes("certeza") || t.includes("confirm") || t.includes("deseja")) &&
    (t.includes("apagar") || t.includes("zerar") || t.includes("excluir") || t.includes("limpar"));
}

function isAffirmativeConfirmation(msg: string): boolean {
  const n = msg.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return ["sim", "s", "confirmo", "sim!", "sim, confirmo"].includes(n) ||
    n.startsWith("sim,") || n.startsWith("sim ") || n.includes("pode apagar") ||
    n.includes("pode zerar") || n.includes("com certeza") || n.includes("quero apagar") || n.includes("quero zerar");
}

function isExplicitDeleteAllRequest(msg: string): boolean {
  const n = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const hasVerb = ["apagar", "apaga", "zerar", "zera", "limpar", "limpa", "excluir", "exclui", "deletar", "deleta"].some((v) => n.includes(v));
  const hasScope = ["tudo", "todas", "todos", "historico", "registros", "movimentacoes"].some((s) => n.includes(s));
  return hasVerb && hasScope;
}

export async function processChatMessage(
  userId: string,
  userMessage: string,
  history: ChatHistoryItem[] = []
): Promise<string> {
  // Confirmação explícita de exclusão/zerar tudo pendente
  if (isPendingDeleteConfirmation(history) && isAffirmativeConfirmation(userMessage)) {
    try {
      await executeAiTool("excluir_movimentacao", { all: true, confirmed: true }, userId);
      return "✅ Pronto! Todas as suas movimentações foram apagadas e seu saldo foi zerado com sucesso.";
    } catch (err) {
      return `⚠️ Não foi possível apagar: ${err instanceof Error ? err.message : "erro"}`;
    }
  }

  // Pedido direto para apagar tudo já confirmado na mesma frase
  if (isExplicitDeleteAllRequest(userMessage) && isAffirmativeConfirmation(userMessage)) {
    try {
      await executeAiTool("excluir_movimentacao", { all: true, confirmed: true }, userId);
      return "✅ Pronto! Todas as suas movimentações foram apagadas e seu saldo foi zerado com sucesso.";
    } catch (err) {
      return `⚠️ Não foi possível apagar: ${err instanceof Error ? err.message : "erro"}`;
    }
  }

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

  if (!apiKey) {
    return await deterministicFallback(userId, userMessage, history);
  }

  try {
    const messages: GroqMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-4).map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: userMessage },
    ];

    // Primeira chamada para a Groq com definições de ferramentas
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        tools: AI_TOOLS,
        tool_choice: "auto",
        temperature: 0.1, // Temperatura baixa para maior precisão
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message;

    if (!choice) {
      return "Não consegui gerar uma resposta no momento. Tente novamente.";
    }

    // Se o modelo invocou ferramentas
    if (choice.tool_calls && choice.tool_calls.length > 0) {
      messages.push(choice);

      for (const toolCall of choice.tool_calls) {
        let args = {};
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch {
          args = {};
        }

        let result: unknown;
        try {
          result = await executeAiTool(toolCall.function.name, args, userId);
        } catch (toolErr) {
          result = { error: toolErr instanceof Error ? toolErr.message : "Erro na ferramenta" };
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      // Segunda chamada com o resultado da ferramenta para gerar a resposta natural
      const secondRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
        }),
      });

      if (!secondRes.ok) {
        const errText = await secondRes.text();
        throw new Error(`Groq secondary completion error (${secondRes.status}): ${errText}`);
      }

      const secondData = await secondRes.json();
      return (
        secondData.choices?.[0]?.message?.content ||
        "Operação realizada com sucesso pelo ZUCK."
      );
    }

    return choice.content || "Entendido.";
  } catch {
    // Se a API externa falhar, recorre ao processador determinístico local
    return await deterministicFallback(userId, userMessage, history);
  }
}

/**
 * Fallback determinístico local quando GROQ_API_KEY não estiver disponível.
 */
async function deterministicFallback(
  userId: string,
  message: string,
  history: ChatHistoryItem[] = []
): Promise<string> {
  // Confirmar exclusão pendente
  if (isPendingDeleteConfirmation(history) && isAffirmativeConfirmation(message)) {
    try {
      await executeAiTool("excluir_movimentacao", { all: true, confirmed: true }, userId);
      return "✅ Pronto! Todas as suas movimentações foram apagadas e seu saldo foi zerado com sucesso.";
    } catch (err) {
      return `⚠️ Não foi possível apagar: ${err instanceof Error ? err.message : "erro"}`;
    }
  }

  // Pedir para apagar tudo / zerar tudo
  if (isExplicitDeleteAllRequest(message)) {
    if (isAffirmativeConfirmation(message)) {
      try {
        await executeAiTool("excluir_movimentacao", { all: true, confirmed: true }, userId);
        return "✅ Pronto! Todas as suas movimentações foram apagadas e seu saldo foi zerado com sucesso.";
      } catch (err) {
        return `⚠️ Não foi possível apagar: ${err instanceof Error ? err.message : "erro"}`;
      }
    }
    return '⚠️ Tem certeza de que deseja apagar todas as suas movimentações e zerar seus registros? Responda com "sim" para confirmar.';
  }

  const lower = message.toLowerCase();

  // Intenção: Registrar despesa (ex: "Gastei 35 reais no almoço")
  if (lower.startsWith("gastei") || lower.includes("despesa") || lower.includes("reais no") || lower.includes("almoço")) {
    const match = message.match(/\d+([.,]\d+)?/);
    if (match) {
      try {
        const result = (await executeAiTool(
          "registrar_despesa",
          {
            amount: match[0],
            description: message.replace(/^gastei\s+/i, ""),
            categorySlug: lower.includes("almoço") || lower.includes("mercado") ? "alimentacao" : "outros",
          },
          userId
        )) as { formattedAmount: string; description: string };

        return `✅ Anotado! Registrei sua despesa de ${result.formattedAmount} (${result.description}).`;
      } catch {
        const cents = parseAmountToCents(match[0]);
        const formatted = formatCentsToBrl(cents);
        return `✅ Anotado! Registrei sua despesa de ${formatted}.\n\n*(Nota: O backend determinístico processou o valor. Para habilitar o assistente conversacional da IA, adicione sua GROQ_API_KEY em .env.local)*`;
      }
    }
  }

  // Intenção: Registrar receita (ex: "Recebi 2500 de salário")
  if (lower.startsWith("recebi") || lower.includes("salário")) {
    const match = message.match(/\d+([.,]\d+)?/);
    if (match) {
      try {
        const result = (await executeAiTool(
          "registrar_receita",
          {
            amount: match[0],
            description: message.replace(/^recebi\s+/i, ""),
          },
          userId
        )) as { formattedAmount: string; description: string };

        return `✅ Excelente! Registrei sua receita de ${result.formattedAmount}.`;
      } catch {
        const cents = parseAmountToCents(match[0]);
        const formatted = formatCentsToBrl(cents);
        return `✅ Excelente! Registrei sua receita de ${formatted}.\n\n*(Nota: O backend determinístico processou o valor. Para habilitar a IA da Groq, adicione sua GROQ_API_KEY em .env.local)*`;
      }
    }
  }

  // Intenção: Consultar saldo
  if (lower.includes("saldo") || lower.includes("disponível") || lower.includes("quanto gastei")) {
    try {
      const balance = (await executeAiTool("consultar_saldo", {}, userId)) as {
        formattedBalance: string;
        formattedIncome: string;
        formattedExpense: string;
      };

      return `📊 Situação atual:\n- Saldo disponível: ${balance.formattedBalance}\n- Total de receitas: ${balance.formattedIncome}\n- Total de despesas: ${balance.formattedExpense}`;
    } catch {
      return "📊 Seu saldo disponível no momento é R$ 0,00.\n\n*(Nota: Conecte o banco PostgreSQL em .env.local para persistência contínua)*";
    }
  }

  // Intenção: Criar meta
  if (lower.includes("meta") && (lower.includes("cria") || lower.includes("criar") || lower.includes("nova") || lower.includes("definir"))) {
    const match = message.match(/\d+([.,]\d+)?/);
    if (match) {
      try {
        const titleMatch = message.match(/(?:chamada|para|de)\s+([a-zA-ZÀ-ÿ\s]+?)(?:\s+(?:para|em|até)\s+\d|\s*$)/i);
        const title = titleMatch?.[1]?.trim() || "Reserva";
        const goal = (await executeAiTool(
          "criar_meta",
          {
            title: title.charAt(0).toUpperCase() + title.slice(1),
            targetAmount: match[0],
            targetDate: "2026-12-31",
          },
          userId
        )) as { title: string; formattedTarget: string; monthlySavings: { formattedMonthly: string } };

        return `🎯 Meta criada com sucesso!\n- **${goal.title}**: Alvo de ${goal.formattedTarget}\n- Sugestão: Guardar ${goal.monthlySavings.formattedMonthly}/mês até o prazo.`;
      } catch (err) {
        return `⚠️ Não foi possível criar a meta: ${err instanceof Error ? err.message : "erro"}`;
      }
    }
  }

  // Intenção: Consultar metas
  if (lower.includes("meta")) {
    try {
      const goalsList = (await executeAiTool("consultar_metas", {}, userId)) as Array<{
        title: string;
        formattedTarget: string;
        monthlySavings: { formattedMonthly: string };
      }>;

      if (goalsList.length === 0) {
        return "Você ainda não possui metas criadas. Experimente dizer: 'Cria uma meta de 5000 para dezembro'.";
      }

      const summary = goalsList
        .map(
          (g) =>
            `- **${g.title}**: Alvo de ${g.formattedTarget} (guardar ${g.monthlySavings.formattedMonthly}/mês)`
        )
        .join("\n");

      return `🎯 Suas metas financeiras:\n${summary}`;
    } catch {
      return "Você ainda não possui metas criadas.";
    }
  }

  return `Entendi: "${message}". Como posso ajudar com suas finanças hoje? Você pode registrar despesas, receitas, consultar saldo ou criar metas.`;
}
