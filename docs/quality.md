# Qualidade

## Comandos

| Comando | O que valida | Quando executar |
|---|---|---|
| `pnpm lint` | ESLint com baseline Next.js, regras locais e guardas Drizzle | Antes de commits e em mudanças de código |
| `pnpm typecheck` | Gera tipos de rotas (`next typegen`) e valida TypeScript strict (`tsc --noEmit`) | Antes de commits e ao alterar tipos ou rotas |
| `pnpm lint:rules` | Self-check das regras locais de lint (`verify-quality-rules.mjs`) | Ao modificar arquivos em `eslint-rules/` |
| `pnpm test` | Executa testes automatizados com Vitest (`src/**/*.test.ts`) | A cada ciclo de implementação ou refatoração |
| `pnpm test:watch` | Modo interativo do Vitest com recarregamento sob demanda | Durante o desenvolvimento |
| `pnpm build` | Compilação de produção e otimização Next.js | Antes de entregar etapas ou gerar releases |
| `pnpm check` | Pipeline completo: lint, typecheck, lint:rules, test e build | Antes de finalizar qualquer tarefa ou PR |
| `pnpm db:generate` | Gera SQL de migrations a partir de `src/db/schema/` sem conectar ao banco | Sempre que o schema Drizzle for alterado |
| `pnpm db:migrate` | Aplica migrations em banco PostgreSQL de desenvolvimento autorizado | Ao atualizar o schema em ambiente de dev |

O pipeline `pnpm check` roda de forma estritamente determinística e não exige credenciais externas (`DATABASE_URL` ou `GROQ_API_KEY`).

## Regras de base

- **TypeScript strict**: sem `any` implícito, validação rigorosa de nulos e tipos estritos.
- **Teto de 350 linhas**: arquivos mantidos pequenos, coesos e focados em uma única responsabilidade.
- **Logger estruturado no servidor**: uso exclusivo de Pino em arquivos de backend (`server-only`). Proibido `console.log` direto no código de produção.
- **Fronteira de dados estrita**: componentes de apresentação (`src/app/`, `src/components/`) nunca importam diretamente `@/db`. Toda persistência passa por funções de serviço/domínio.
- **Proteções Drizzle**: regras `drizzle/enforce-delete-with-where` e `drizzle/enforce-update-with-where` ativas no linter.
- **Validação de ambiente e entradas**: esquemas Zod protegem parâmetros e variáveis de ambiente; erros nunca vazam valores sensíveis.
- **Aritmética monetária determinística**: quantias financeiras sempre em centavos (números inteiros), proibindo ponto flutuante decimal para cálculo de saldos.

## Estratégia de testes

A suíte atual (`vitest run`) roda em ambiente Node isolado e cobre as fronteiras essenciais de infraestrutura:
1. `src/lib/env.test.ts`: valida parsing de variáveis de ambiente, aceitação estrita de protocolos PostgreSQL e garantia de não-exposição de credenciais em mensagens de erro.
2. `src/lib/logger.test.ts`: assegura redação automática de chaves sensíveis (senhas, tokens, cookies, URLs de conexão) sem descartar contexto estruturado.
3. `src/db/index.test.ts`: valida criação sob demanda, reuso e encerramento limpo do pool `pg` mockado, além do tratamento de falhas em conexões ociosas.

Testes das regras de negócio do MVP (validação de entradas da IA, registro de despesas/receitas e cálculo de saldo por usuário) serão adicionados na próxima entrega junto das funções de serviço.

## Revisão após implementação ou correção

Ao concluir um ciclo de implementação ou correção, sugerir ao usuário de **3 a 8 ciclos posteriores de code review**, com quantidade proporcional ao risco e escopo da entrega, focos complementares e prompt executável com checks reais. Essa faixa é convenção do projeto; revisões adicionais dependem de pedido explícito do usuário.

Cada ciclo verifica o estado atual e o código conectado, registra achados com severidade, local e evidência e reavalia correções autorizadas com os checks afetados. Correções da mesma rodada não reiniciam a contagem. Termina-se com verificação integrada e riscos residuais.

## Dependências e entrega

- **Auditoria de produção (`pnpm audit --prod`)**: 0 vulnerabilidades. Dependências de runtime são limpas.
- **Auditoria de desenvolvimento (`pnpm audit`)**: 2 vulnerabilidades em dependências de ferramentas upstream:
  1. `braces <= 3.0.3` (alta): transitiva de `eslint-config-next` > `@next/eslint-plugin-next` > `fast-glob` > `micromatch`. Aguardando correção oficial no ecossistema ESLint/Next.
  2. `esbuild <= 0.24.2` (moderada): transitiva de `drizzle-kit` > `@esbuild-kit/esm-loader` > `@esbuild-kit/core-utils`. Aguardando atualização do `drizzle-kit`.
- Checks são comandos explícitos. Não são impostos bloqueios arbitrários de Git (`pre-commit`, `pre-push` ou branch protection).
