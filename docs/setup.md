# Setup e evidências

## Origem e contexto

- **Data da verificação**: 15 de outubro de 2026.
- **Revisão do toolkit**: commit `f13bb354363dafef8ce8d8f605856cc9e1cc52cc` (`vibe-coding-toolkit`).
- **Produto**: ZUCK — Seu copiloto financeiro (conforme especificação fornecida e `PRODUCT.md`).
- **Runtime**: Node.js 24.11.0, Windows x64.
- **Gerenciador de pacotes**: pnpm 12.11.2 (fixado em `package.json`).
- **Shell**: PowerShell 7 / Windows (execução com wrappers `.cmd` para contornar política de scripts).

## Decisões e fontes

| Decisão | Motivo | Fonte / Data | Condição para revisar |
|---|---|---|---|
| Next.js 16.4.1 (App Router) estável | Base oficial do projeto com TypeScript strict, Tailwind 4 e ESLint 9 | `create-next-app` 16.4.1, 2026-10-15 | Lançamento de versão estável superior |
| Drizzle ORM 0.45.4 + PostgreSQL (`pg`) | Persistência solicitada pelo produto e padrão do toolkit | `docs/06-project-defaults.md`, 2026-10-15 | Necessidade de runtime Edge ou driver HTTP |
| `typecheck` com `next typegen && tsc --noEmit` | Next 16 introduz tipos globais de rotas (`LayoutProps`/`PageProps`) gerados sob demanda | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`, 2026-10-15 | Alteração na geração de tipos pelo Next |
| `allowBuilds: { esbuild: true }` | pnpm 12 bloqueia scripts de build por padrão; esbuild é exigido por vitest e drizzle-kit | Log de instalação do pnpm, 2026-10-15 | Dependências removerem scripts de postinstall |
| Skills instaladas via `--copy` | No Windows, junctions com destinos absolutos quebram portabilidade; cópia local versionada preserva integridade | `docs/tools/16-vercel-skills.md`, 2026-10-15 | Ambiente com suporte a symlinks relativos nativos |
| Provedor IA Groq encapsulado | Permite trocar provedor ou modelo (`openai/gpt-oss-20b`) sem reescrever o domínio | `PRODUCT.md`, 2026-10-15 | Migração de provedor LLM |

## Componentes

| Componente | Ação e motivo | Escopo | Estado e evidência |
|---|---|---|---|
| Next.js, React, React-DOM | Scaffolding da base oficial web | Projeto | 16.4.1 / 19.3.0 instalado via pnpm; build validado |
| Tailwind CSS v4 | Estilização utilitária moderna via `@tailwindcss/turbopack` | Projeto | 4.3.3 instalado e configurado em `src/app/globals.css` |
| Drizzle ORM + drizzle-kit | Mapeamento relacional e controle de migrations | Projeto | `drizzle-orm@0.45.4` e `drizzle-kit@0.31.11` instalados; `db:generate` funcional |
| pg + @types/pg | Driver PostgreSQL para runtime Node.js | Projeto | `pg@8.23.1` instalado; pool com lifecycle testado |
| Zod | Validação em runtime de ambiente e entradas de IA | Projeto | `zod@4.6.7` instalado e validado em `src/lib/env.test.ts` |
| Pino | Logger estruturado do servidor com redação de segredos | Projeto | `pino@10.4.0` instalado; redação validada em teste |
| Vitest | Suíte de testes automatizados para Node.js | Projeto | `vitest@5.0.4` instalado; 8 testes unitários passando |
| ESLint 9 + regras locais | Linter com teto de 350 linhas e guardas de fronteira | Projeto | `eslint.config.mjs` ativo; `quality/` rules verificadas |
| Skills Vercel (8 web + find-skills) | Catálogo oficial de boas práticas para agentes | Projeto | 9 skills copiadas para `.agents/skills/`; `skills-lock.json` criado |
| Ponytail / Caveman / Superpowers | Acordos operacionais para agentes de código | Projeto | Configurados como acordos em `AGENTS.md` (plugins globais não instalados) |
| Graphify | Exclusões de grafo determinístico | Projeto | `.graphifyignore` copiado e versionado |
| Context7 | Consulta a documentação atualizada | Host / MCP | Reutilizado conforme ambiente do cliente |

## Documentação criada

- `PRODUCT.md`: especificação do ZuckBot (problema, público, fluxos, ferramentas da IA, restrições e aceite).
- `README.md`: porta de entrada do projeto com instruções de execução e mapa documental.
- `AGENTS.md`: regras de engenharia, limites de ferramentas e convenções de trabalho dos agentes.
- `CLAUDE.md`: ponte direta de uma linha importando `AGENTS.md`.
- `docs/architecture.md`: mapeamento do código efetivo, fronteiras e fluxo de tool calling.
- `docs/design.md`: direção visual em português do Brasil e critérios de acessibilidade para o chat.
- `docs/onboarding.md`: passo a passo para execução local, banco e resolução de problemas conhecidos.
- `docs/quality.md`: inventário de comandos, regras de base, suíte de testes e auditorias.
- `docs/setup.md`: este registro detalhado de fontes, evidências e pendências.

## Verificações

| Item | Estado | Evidência |
|---|---|---|
| `pnpm lint` | Validado | Execução limpa do ESLint em todo o repositório sem erros ou warnings |
| `pnpm typecheck` | Validado | `next typegen && tsc --noEmit` executado com sucesso e zero erros |
| `pnpm lint:rules` | Validado | `verify-quality-rules.mjs` aprovou `max-lines`, `no-direct-console` e `no-direct-data-access` |
| `pnpm test` | Validado | 4 arquivos de teste (`env`, `logger`, `db`, `transactions`), 19 testes aprovados em ~2.3s |
| `pnpm build` | Validado | Build de produção Next.js gerado com sucesso |
| `pnpm check` | Validado | Pipeline composto executado com código de saída 0 |
| `pnpm db:generate` | Validado | `drizzle-kit generate` executou sem conexão e gerou `drizzle/0000_loud_ezekiel.sql` (4 tabelas: users, categories, transactions, goals) |
| Servidor HTTP | Validado | `pnpm start -p 3457` retornou HTTP 200, título verificado e atributo `lang="pt-BR"` confirmado; processo encerrado e porta liberada |
| Descoberta de skills | Validado | `npx skills list` reconhece as 9 skills em `.agents/skills/` com lockfile íntegro |
| Auditoria de produção | Validado | `pnpm audit --prod` reportou 0 vulnerabilidades |
| Auditoria de desenvolvimento | Registrado | `pnpm audit` identificou 2 advisories conhecidos em ferramentas de dev (`braces` em `eslint-config-next` e `esbuild` em `drizzle-kit`), sem correção upstream disponível no momento |

## Pendências e próxima entrega

### Pendências externas
1. **Instância PostgreSQL**: obter conexão de banco de desenvolvimento e preencher `DATABASE_URL` em `.env.local` para rodar `pnpm db:migrate`.
2. **Chave de API Groq**: criar chave no console da Groq e preencher `GROQ_API_KEY` em `.env.local` para alimentar o assistente de chat.
3. **Biblioteca de autenticação**: avaliar e selecionar solução de autenticação (ex.: Better Auth ou Auth.js) para associar `userId` da sessão aos registros.

### Próxima entrega do MVP
Integrar o cliente da Groq (`openai/gpt-oss-20b`) atrás de uma interface adaptadora própria em `src/lib/ai/`, mapeando as ferramentas do backend (`registrar_despesa`, `registrar_receita`, `consultar_saldo`) para chamadas determinísticas a partir de mensagens em linguagem natural no chat.

---

### Sugestão de Code Review
Recomenda-se executar de **3 a 5 ciclos de code review** focados nesta fundação:
1. **Ciclo 1: Configuração e Dependências** — conferir `package.json`, `pnpm-workspace.yaml`, `.gitignore` e `pnpm-lock.yaml`.
2. **Ciclo 2: Infraestrutura Servidor** — revisar ciclo de vida do pool em `src/db/index.ts`, validação de ambiente e redação de logs.
3. **Ciclo 3: Qualidade e Linter** — auditar regras customizadas de lint em `eslint-rules/` e guardas de fronteira.
4. **Ciclo 4: Documentação e Alinhamento com Produto** — confrontar `PRODUCT.md` e a arquitetura planejada contra os critérios de aceitação.

Prompt copiável para iniciar os ciclos:
```text
Execute uma rodada de code review em 4 ciclos sobre o bootstrap do ZUCK:
- Ciclo 1: Configuração de dependências, scripts do pnpm e integridade do lockfile.
- Ciclo 2: Infraestrutura de banco, pool de conexões, parsing de ambiente e redação de logs.
- Ciclo 3: Regras locais do ESLint, limites de linhas e fronteiras entre camadas.
- Ciclo 4: Conformidade da documentação técnica e critérios de aceitação em PRODUCT.md.
Valide com 'pnpm check' ao final de cada verificação.
```
