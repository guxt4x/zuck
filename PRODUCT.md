# ZUCK — Seu copiloto financeiro

## Problema e objetivo

Aplicativos financeiros tradicionais exigem abrir o app, achar a categoria certa, preencher formulários e interpretar gráficos. Esse atrito faz muita gente abandonar o controle financeiro — inclusive anotar entradas e saídas de caixa no dia a dia.

O ZUCK é um assistente financeiro pessoal conversacional: o usuário escreve normalmente ("Gastei 35 reais no almoço") e o assistente registra, consulta, calcula e analisa usando os dados reais do próprio usuário.

Objetivo do MVP: uma primeira versão funcional, simples e completa o suficiente para testar com usuários reais usando o plano gratuito da Groq, validando a experiência conversacional, a utilidade do assistente e a formação de hábito.

## Público e papéis

- **Usuário final:** jovens e adultos que querem organizar finanças, controlar gastos, economizar e atingir objetivos, mas não têm disciplina ou interesse em planilhas e apps financeiros tradicionais.
- Um único papel no MVP: cada usuário vê e altera apenas os próprios dados. Não há equipes, administradores ou contas compartilhadas.
- Contexto de uso: celular em primeiro lugar (registro no momento do gasto), também desktop.

## Fluxos da versão inicial

| Fluxo | Entrada | Ação | Resultado esperado |
|---|---|---|---|
| Registrar despesa | "Gastei 80 reais no mercado hoje." | IA identifica `registrar_despesa`, extrai valor, descrição, categoria e data; backend valida e grava | Confirmação com valor, categoria e data registrados |
| Registrar receita | "Recebi 2500 de salário." | IA chama `registrar_receita`; backend valida e grava | Confirmação do registro |
| Consultar situação | "Quanto tenho disponível?", "Quanto gastei esse mês?" | IA chama ferramenta de consulta; backend calcula de forma determinística | Resposta natural baseada no número calculado pelo backend |
| Gastos por categoria/período | "Quanto gastei com comida?" | `consultar_gastos_por_categoria` / `consultar_resumo_periodo` | Totais por categoria e período |
| Corrigir/excluir | "Na verdade foram 40 reais." / "Apaga esse último gasto." | IA identifica a movimentação; **pede confirmação** antes de excluir | Movimentação atualizada ou excluída após confirmação |
| Criar meta | "Cria uma meta de 5 mil reais para dezembro." | `criar_meta`; backend calcula quanto guardar por mês | Meta criada com valor mensal necessário |
| Acompanhar meta | "Quanto falta para minha meta?" | `consultar_metas` | Progresso e valor restante |
| Análise | "Como estão minhas finanças?", "Estou gastando demais?" | Backend agrega dados do período; IA explica | Resumo, maiores categorias, gastos acima da média e sugestões concretas |

## MVP

Em ordem de prioridade:

1. **Conta e isolamento:** cadastro/entrada e dados financeiros isolados por usuário.
2. **Registro de movimentações:** despesas, receitas e transferências; extração automática de valor, descrição, categoria e data; correção e exclusão (com confirmação).
3. **Categorias fixas:** Alimentação, Transporte, Moradia, Lazer, Saúde, Compras, Educação, Contas, Outros. O modelo de dados deve permitir categorias personalizadas depois, sem implementá-las agora.
4. **Consultas:** saldo atual, total de receitas, total de despesas, gastos por categoria, gastos por período, últimas movimentações, comparação entre períodos.
5. **Metas:** criar meta com valor objetivo e prazo, calcular quanto guardar por mês, acompanhar progresso e quanto falta.
6. **Análise inteligente:** resumo mensal, categorias com maior gasto, gastos acima da média, sugestões simples de economia, avaliação geral e explicação dos principais problemas — sempre a partir de números calculados pelo backend.
7. **Chat web simples:** interface conversacional que mantém o contexto da conversa.

Ferramentas expostas à IA: `registrar_despesa`, `registrar_receita`, `listar_movimentacoes`, `consultar_saldo`, `consultar_gastos_por_categoria`, `consultar_resumo_periodo`, `criar_meta`, `consultar_metas`, `atualizar_meta`, `excluir_movimentacao`.

## Fora de escopo

Adiado explicitamente para depois da validação do núcleo: áudio, leitura de comprovantes, cartões de crédito, contas recorrentes, alertas inteligentes, previsão de saldo, simulação de decisões, copiloto proativo, gamificação, WhatsApp/Telegram, aplicativo mobile, Open Finance, planos premium/cobrança e categorias personalizadas.

## Requisitos

- **Idioma:** interface e respostas em português do Brasil; moeda BRL.
- **Comportamento do assistente:** conversar naturalmente, manter contexto, não inventar dados financeiros, confirmar informações ambíguas, confirmar ações destrutivas ou críticas, ser direto, evitar respostas genéricas e basear recomendações nos dados reais do usuário.
- **Princípio de arquitetura:** a IA interpreta a intenção e chama ferramentas; o backend executa cálculos e validações de forma determinística e devolve resultados para a IA redigir a resposta. O LLM não faz cálculos financeiros críticos.
- **Valores monetários:** armazenados como inteiros em centavos; aritmética sem ponto flutuante binário; arredondamento definido e testado no backend.
- **Segurança:** toda consulta e escrita filtrada pelo usuário autenticado; entradas das ferramentas validadas com Zod; chave da Groq apenas no servidor; logs sem dados financeiros completos ou segredos.
- **Validação:** valores positivos, datas válidas, categoria pertencente à lista, meta com prazo futuro; operações de exclusão/alteração exigem confirmação explícita na conversa.
- **Acessibilidade:** HTML semântico, teclado, foco visível, contraste adequado, estado de espera durante a resposta da IA e proteção contra envio duplicado.

## Restrições e decisões técnicas

- Next.js estável (App Router), TypeScript strict, Tailwind, pnpm e Node.js 24. Versões efetivas em `docs/setup.md` e no lockfile.
- Persistência: Drizzle ORM + PostgreSQL (driver `pg`), conforme pedido do produto.
- IA: Groq, modelo inicial `openai/gpt-oss-20b`, com tool calling. A integração deve ficar atrás de uma interface própria para permitir trocar provedor/modelo.
- Usar o plano gratuito da Groq no início e **minimizar tokens**: prompt de sistema curto, histórico de conversa limitado/resumido, resultados das ferramentas compactos.
- Backend é o dono das regras de negócio; nada de funcionalidades antes de validar o núcleo.
- Simples de testar localmente; priorizar funcionamento e experiência antes de complexidade visual.
- Projetado para receber recursos premium (SaaS) depois, sem reconstruir a arquitetura — sem implementar cobrança agora.

## Hipóteses e pendências

| Item | Tipo | Impacto | Próximo passo |
|---|---|---|---|
| Autenticação por e-mail e senha com sessão no servidor | Hipótese reversível | Necessária para isolar dados por usuário | Escolher a biblioteca (ex.: Better Auth ou Auth.js) consultando documentação atual, antes do primeiro fluxo com dados |
| "Disponível" = receitas − despesas do mês corrente | Hipótese reversível | Define a resposta de "Quanto ainda posso gastar?" (fluxo `consultar_orçamento` do exemplo, sem ferramenta própria na lista) | Implementar em `consultar_saldo`/`consultar_resumo_periodo`; revisar com usuários |
| Transferência = movimentação entre contas do próprio usuário (ex.: conta → reserva) | Hipótese reversível | Exige um conceito mínimo de conta/carteira; não altera o saldo total | Confirmar com o produto antes de modelar; se não houver contas, tratar como movimento neutro para metas |
| Fuso `America/Sao_Paulo` para "hoje", "esse mês" | Hipótese reversível | Afeta períodos e datas extraídas | Guardar data local da movimentação; revisar se houver usuários fora do Brasil |
| Histórico do chat persistido por usuário, com janela curta enviada ao modelo | Hipótese reversível | Contexto vs. consumo de tokens | Medir tokens por conversa no teste com usuários |
| `GROQ_API_KEY` | **Pendente (externo)** | Sem chave, o chat não responde | Usuário cria a chave no console Groq e coloca em `.env.local` |
| `DATABASE_URL` (PostgreSQL local ou gerenciado) | **Pendente (externo)** | Sem banco, nenhum fluxo de dados roda | Definir banco de desenvolvimento autorizado |
| Limites do plano gratuito da Groq para `openai/gpt-oss-20b` | **Pendente (verificar)** | Pode limitar testes simultâneos | Conferir limites atuais no console antes do teste com usuários |

## Critérios de aceitação

Produto:

- Um usuário novo entra no sistema e, em poucos minutos e sem instruções, registra movimentações, consulta sua situação, cria uma meta e faz perguntas sobre os próprios dados.
- "Gastei 80 reais no mercado hoje" gera uma despesa de R$ 80,00, categoria Alimentação, data de hoje, e a resposta confirma esses dados.
- Totais, saldos e valores mensais de meta exibidos pela IA são idênticos aos calculados pelo backend para o mesmo período.
- Mensagens ambíguas (sem valor, por exemplo) geram uma pergunta de confirmação em vez de um registro inventado.
- Exclusões e alterações só acontecem depois de confirmação explícita do usuário.
- Um usuário nunca vê ou altera dados de outro usuário (testado no servidor).
- Perguntas sem dados suficientes recebem resposta honesta ("ainda não há registros neste período"), sem números inventados.

Os checks técnicos do setup ficam em `docs/quality.md` e `docs/setup.md`.

## Próxima entrega

Integrar o provedor de IA (Groq `openai/gpt-oss-20b` via interface própria em `src/lib/ai/`) com tool calling mapeado para `registrar_despesa`, `registrar_receita` e `consultar_saldo`, e montar a tela inicial web com interface conversacional de chat (histórico de mensagens e campo de entrada).

## Manutenção

Atualize este documento quando objetivo, escopo, restrições ou critérios de aceitação mudarem. Decisões técnicas e evidências detalhadas ficam em docs/architecture.md e docs/setup.md. O nome do arquivo gerado é PRODUCT.md.
