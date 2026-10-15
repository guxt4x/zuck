<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ZUCK — Seu copiloto financeiro

## Produto e stack

- Produto e escopo: `PRODUCT.md`.
- Stack: Next.js 16.4 (App Router), React 19.3, TypeScript 5.9 strict, Tailwind 4, Drizzle ORM 0.45 + PostgreSQL (`pg`), Zod 4, Pino 10, Vitest 5. Node.js 24, pnpm 12 (`packageManager` no `package.json`).
- IA (planejada): Groq, modelo `openai/gpt-oss-20b`, tool calling atrás de uma interface própria.
- Setup e validações: `docs/setup.md`.

## Comandos canônicos

- Instalar: `pnpm install`
- Desenvolver: `pnpm dev`
- Lint: `pnpm lint`
- Tipos: `pnpm typecheck` (gera tipos de rota com `next typegen` e roda `tsc --noEmit`)
- Regras locais de lint: `pnpm lint:rules`
- Testes: `pnpm test` (`pnpm test:watch` em desenvolvimento)
- Build: `pnpm build`
- Verificar base: `pnpm check`
- Banco: `pnpm db:generate` (gera SQL sem conectar) e `pnpm db:migrate` (somente em banco autorizado)

No PowerShell com política de scripts restrita, use `pnpm.cmd`/`npx.cmd`.

## Regras do domínio

- **A IA não calcula dinheiro.** Ela interpreta a intenção e chama ferramentas do backend; o backend valida, calcula e grava de forma determinística.
- Valores monetários em centavos (inteiros). Nunca use `number` com casas decimais para somar dinheiro.
- Toda consulta e escrita filtra pelo usuário autenticado. Nenhuma ferramenta recebe `userId` vindo do modelo.
- Entradas das ferramentas da IA são validadas com Zod no servidor antes de qualquer acesso ao banco.
- Exclusão/alteração de movimentações exige confirmação explícita do usuário na conversa.
- A IA não inventa dados: sem registros, responde que não há dados.
- Minimize tokens: prompt de sistema curto, histórico limitado, resultados de ferramentas compactos.
- `GROQ_API_KEY` só no servidor; nunca em `NEXT_PUBLIC_*`.

## Acordos de trabalho

- Leia código e instruções pertinentes antes de editar. Declare hipóteses que alterem comportamento ou escopo.
- Complete o pedido com a menor mudança suficiente. Reutilize padrões, componentes e dependências existentes.
- Preserve alterações locais, validação, tratamento de erros, segurança, acessibilidade e requisitos explícitos.
- Não crie abstrações, arquitetura, opções, dependências ou funcionalidades para necessidades não solicitadas.
- Execute checks adequados. Teste lógica relevante e regressões; mudanças triviais não precisam de testes que apenas reproduzem a implementação.
- Não transforme hipóteses em fatos ou integrações pendentes em resultados simulados.
- Continue trabalho já autorizado. Pergunte somente por informação indispensável ou por ação fora da autorização.
- Publicação, mensagens a terceiros, custos e ações destrutivas dependem de autorização pertinente. Instalar ferramentas não concede essa autorização.

## Continuidade de execução

- Durante trabalho autorizado, responda a perguntas de status e retome as ações restantes. Pare se o usuário pedir pausa, cancelar ou mudar o objetivo. Sem execução em andamento, um pedido apenas informativo termina com a resposta.
- Um bloqueio impede só tarefas dependentes. Conclua as independentes que ainda forem seguras e autorizadas; antes de encerrar, confira se resta ação executável no escopo.
- Se um agente falhar ou ficar com estado incerto, confirme que parou antes de assumir seus arquivos. Inspecione alterações parciais e retome do ponto verificado, sem escritores concorrentes.
- Não repita tentativa idêntica sem evidência nova. Respeite limites de custo, tempo e tentativas, gates explícitos e negativas; decisões anteriores não ampliam autorização.
- Ao retomar por handoff, confira arquivos, Git, checks e processos reais. Só afirme execução em segundo plano quando houver processo, agente ou automação ativo e verificável.
- Sem alternativa segura, informe o bloqueio, o trabalho concluído e o que falta para retomar; não apresente pendência como resultado nem prometa continuação automática.

## Padrões e documentação

- Persistência: Drizzle ORM + PostgreSQL com driver `pg` (runtime Node.js). Schema em `src/db/schema/`, SQL em `drizzle/`, conexão única em `src/db/index.ts`.
- Conexão servidor única, pool limitado e inicialização sob demanda. Gere e revise SQL antes de aplicar migrations em destino autorizado; não migre no build ou por request.
- Valide entradas e ambiente com Zod. Use Pino no servidor, sem segredos ou corpos completos. Apresentação (`src/app`, `src/components`) chama módulos da funcionalidade, sem importar o cliente de banco.
- Prefira tipos inferidos, consultas parametrizadas, projeções explícitas, listagens limitadas e DTOs seguros. Transações seguem a atomicidade exigida.
- Consulte fontes oficiais atuais e o canal estável antes de alterar stack/APIs. Registre fonte, motivo e resultado em `docs/setup.md`. Não migre versões principais ou serviços automaticamente.
- `PRODUCT.md` guarda escopo; `docs/architecture.md`, estrutura e decisões; `docs/design.md`, interface; `docs/onboarding.md`, preparação; `docs/quality.md`, checks. Atualize o documento responsável junto da mudança, sem duplicar regras.

## Ferramentas e estilo

- **Ponytail (`full`):** menor solução completa. `stop ponytail` desativa o modo. Plugin não instalado neste host (ver `docs/setup.md`); vale como acordo.
- **Caveman:** conversa concisa no idioma do usuário, preservando clareza. Código, documentação e commits têm redação normal. `stop caveman` desativa o estilo. Plugin não instalado; vale como acordo.
- **Superpowers:** processo proporcional ao escopo; instruções explícitas e execução já autorizada prevalecem sobre aprovações repetidas. Plugin não instalado; vale como acordo.
- **Context7:** consulte documentação atual para APIs, bibliotecas e setup, um conceito por vez, sem segredos ou código privado. Se indisponível, use fontes oficiais (inclusive `node_modules/next/dist/docs/`) e registre a limitação.
- **RTK:** não instalado; rode comandos diretamente.
- **Graphify:** CLI não instalada; `.graphifyignore` está pronto. Não invente relações sem grafo.
- **LLMs:** preserve cliente nativo, modelo principal e autenticação autorizados. Sem política de seleção autorizada, subagentes usam o modelo da sessão. Não troque provedor nem ative API paga ou proxy silenciosamente.

Confira instalação e descoberta antes de depender de uma ferramenta. Uma preferência escrita não instala um plugin.

## Skills para Next.js

Instaladas em `.agents/skills/` (cópias, `skills-lock.json`):

- `vercel-react-best-practices`: ao escrever/revisar React/Next, dados e desempenho.
- `vercel-composition-patterns`: em decisões concretas de composição e API de componentes.
- `web-design-guidelines`: revisão de interface e acessibilidade.
- `writing-guidelines`: revisão de documentação e prosa.
- `vercel-react-view-transitions`: transições solicitadas e compatíveis com as versões.
- `vercel-optimize`: otimização com tarefa pertinente e métricas Vercel disponíveis.
- `deploy-to-vercel`: publicação/preview autorizados.
- `vercel-cli-with-tokens`: operações Vercel com esse método de autenticação escolhido.
- `find-skills`: descoberta quando faltar uma capacidade concreta.

Instalar skills não executa suas ações. Não force animações, cache, deploy ou mudanças de arquitetura só porque uma skill está disponível.

## Git e colaboração

- Não adicione bloqueios de push em `main`, exigência de branch/worktree ou hooks `pre-commit`/`pre-push` por padrão.
- Lint, tipos, testes e build são checks explícitos; configurações Git adicionais entram quando solicitadas.
- Delegue quando solicitado ou pelo fluxo pertinente e suportado. Tarefas paralelas precisam de arquivos distintos e independência na mesma onda.
- Use ferramentas reais do host; nomes ilustrativos de agentes não são capacidades instaladas.

## Delegação e subagentes

Delegue somente quando isolamento de contexto, especialização ou paralelismo independente compensarem a coordenação; prefira execução direta para tarefas simples. Siga [.agents/rules/parallel-subagent-driven-development.md](.agents/rules/parallel-subagent-driven-development.md).

### Elenco de especialistas e roteamento (ZUCK)

| Especialista | Quando usar | Arquivos típicos |
|---|---|---|
| `database-architect` | Schemas Drizzle, migrations SQL, integridade relacional e índices | `src/db/schema/**`, `drizzle/**`, `drizzle.config.ts` |
| `backend-specialist` | Lógica de negócio, cálculos determinísticos em centavos e validações Zod | `src/features/**/service.ts`, `src/features/**/schemas.ts`, `src/lib/env*.ts` |
| `ai-tools-specialist` | Integração Groq (`openai/gpt-oss-20b`), prompts compactos e mapeamento de tool calls | `src/lib/ai/**`, rotas de chat, tool definitions |
| `frontend-specialist` | Componentes do chat web, Server/Client components, Tailwind 4 e acessibilidade | `src/app/**`, `src/components/**`, `src/lib/utils.ts` |
| `security-reviewer` | Auditoria de segurança: garantir `userId` da sessão (nunca da IA), segredos e OWASP | Somente leitura sobre qualquer arquivo |
| `test-engineer` | Testes automatizados Vitest (TDD, casos de borda e cálculos de saldo) | `src/**/*.test.ts`, `vitest.config.mts` |
| `code-reviewer` | Revisão geral pós-implementação: qualidade, teto de 350 linhas e fronteiras de dados | Somente leitura sobre o diff da tarefa |

### Regras de ondas paralelas

- Cada tarefa declara `Files:` exatos e `Depends-on:`. Na dúvida, depende de tudo (serial).
- Duas tarefas só rodam na mesma onda se tiverem arquivos **totalmente disjuntos** e **zero dependência mútua**.
- Implementadores nunca fazem commit sozinhos; o coordenador revisa os diffs e faz os commits em ordem.
- Revisores paralelos trabalham simultaneamente apenas porque operam em **somente leitura**.

## Revisão após implementação ou correção

- Após cada ciclo de implementação ou correção, sugira ao usuário de **3 a 8 ciclos posteriores de code review**, com quantidade e focos conforme risco e escopo, motivo e prompt copiável com checks reais. A sugestão não autoriza executar novas rodadas automaticamente.
- Em uma rodada solicitada, cada ciclo revisa o estado atual, registra achados com severidade/local/evidência e verifica correções autorizadas. Correções internas não reiniciam a contagem.

## Convenções e contexto

- Alias `@/*` → `src/*`. Código servidor importa `server-only`.
- Ambiente: `src/lib/env.ts` (validação Zod em `env-schema.ts`); logger: `src/lib/logger.ts`; classes: `cn` em `src/lib/utils.ts`.
- Funcionalidades novas viram módulos por domínio quando o primeiro fluxo existir (ex.: `src/features/transactions/`), sem camadas vazias.
- Teto de 350 linhas por arquivo (lint).
