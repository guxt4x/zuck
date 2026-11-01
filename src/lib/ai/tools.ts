import "server-only";
import { getDb } from "@/db";
import {
  clearAllTransactions,
  deleteTransaction,
  getBalance,
  getCategoryExpenses,
  getPeriodSummary,
  listTransactions,
  registerExpense,
  registerIncome,
} from "@/features/transactions/service";
import {
  createGoal,
  listGoals,
  updateGoal,
} from "@/features/goals/service";
import { ensureUserExists } from "@/features/users/service";

export const AI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "registrar_despesa",
      description: "Registra uma despesa do usuário.",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: ["number", "string"],
            description: "Valor da despesa (ex: 35 ou '35,50' ou '35.50')",
          },
          description: {
            type: "string",
            description: "Descrição da despesa (ex: 'almoço', 'mercado')",
          },
          categorySlug: {
            type: "string",
            description:
              "Categoria: alimentacao, transporte, moradia, lazer, saude, compras, educacao, contas, outros",
          },
          date: {
            type: "string",
            description: "Data da despesa em formato YYYY-MM-DD (opcional)",
          },
        },
        required: ["amount", "description"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "registrar_receita",
      description: "Registra uma receita ou entrada financeira do usuário.",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: ["number", "string"],
            description: "Valor da receita (ex: 2500)",
          },
          description: {
            type: "string",
            description: "Descrição da receita (ex: 'salário', 'freela')",
          },
          categorySlug: {
            type: "string",
            description: "Categoria da receita (opcional, padrão 'outros')",
          },
        },
        required: ["amount", "description"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "consultar_saldo",
      description: "Consulta o saldo atual e totais de receitas e despesas.",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string", description: "Data de início YYYY-MM-DD" },
          endDate: { type: "string", description: "Data de fim YYYY-MM-DD" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "consultar_gastos_por_categoria",
      description: "Consulta despesas agrupadas por categoria com totais e percentuais.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "consultar_resumo_periodo",
      description: "Resumo financeiro completo com saldo e principais categorias.",
      parameters: {
        type: "object",
        properties: {
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "listar_movimentacoes",
      description: "Lista as movimentações financeiras recentes.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Quantidade de itens (padrão 10)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "criar_meta",
      description: "Cria uma meta financeira com valor alvo e prazo.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título da meta (ex: 'Viagem')" },
          targetAmount: { type: ["number", "string"], description: "Valor objetivo" },
          targetDate: { type: "string", description: "Prazo final (ex: '2026-12-31')" },
          currentAmount: { type: ["number", "string"], description: "Valor já guardado" },
        },
        required: ["title", "targetAmount"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "consultar_metas",
      description: "Consulta as metas financeiras, progresso e quanto guardar por mês.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "atualizar_meta",
      description: "Adiciona valor a uma meta existente ou atualiza seu montante.",
      parameters: {
        type: "object",
        properties: {
          goalId: { type: "string", description: "ID da meta" },
          addedAmount: { type: ["number", "string"], description: "Valor a somar" },
        },
        required: ["goalId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "excluir_movimentacao",
      description:
        "Exclui uma movimentação específica pelo ID ou apaga todas as movimentações (zerar tudo/apagar tudo) quando all=true. Exige confirmação explícita do usuário.",
      parameters: {
        type: "object",
        properties: {
          transactionId: {
            type: "string",
            description: "ID da movimentação a excluir (opcional se all=true, ou 'todas'/'all')",
          },
          all: {
            type: "boolean",
            description: "Defina como true se o usuário pediu para apagar tudo, zerar tudo ou limpar as movimentações.",
          },
          confirmed: {
            type: "boolean",
            description: "Se o usuário confirmou explicitamente a exclusão (ex: respondeu 'sim', 'confirmo', 'pode apagar').",
          },
        },
      },
    },
  },
];

/**
 * Despachante seguro de ferramentas da IA.
 * Regra inegociável: O userId SEMPRE vem da sessão autenticada, nunca do modelo.
 */
export async function executeAiTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
  dbClient?: ReturnType<typeof getDb>
): Promise<unknown> {
  if (!userId || !userId.trim()) {
    throw new Error("Usuário não autenticado.");
  }

  await ensureUserExists(userId, dbClient);

  switch (toolName) {
    case "registrar_despesa":
      return await registerExpense(userId, args, dbClient);

    case "registrar_receita":
      return await registerIncome(userId, args, dbClient);

    case "consultar_saldo":
      return await getBalance(userId, args, dbClient);

    case "consultar_gastos_por_categoria":
      return await getCategoryExpenses(userId, dbClient);

    case "consultar_resumo_periodo":
      return await getPeriodSummary(userId, args, dbClient);

    case "listar_movimentacoes":
      return await listTransactions(userId, args, dbClient);

    case "criar_meta":
      return await createGoal(userId, args, dbClient);

    case "consultar_metas":
      return await listGoals(userId, dbClient);

    case "atualizar_meta":
      return await updateGoal(userId, args, dbClient);

    case "excluir_movimentacao":
    case "zerar_movimentacoes":
    case "apagar_tudo": {
      const transactionId = typeof args.transactionId === "string" ? args.transactionId.trim() : "";
      const isAll =
        Boolean(args.all) ||
        transactionId === "all" ||
        transactionId === "todas" ||
        transactionId === "*" ||
        toolName !== "excluir_movimentacao";
      const confirmed = Boolean(args.confirmed);

      if (isAll || !transactionId) {
        return await clearAllTransactions(userId, confirmed, dbClient);
      }
      return await deleteTransaction(userId, transactionId, confirmed, dbClient);
    }

    default:
      throw new Error(`Ferramenta desconhecida: "${toolName}"`);
  }
}
