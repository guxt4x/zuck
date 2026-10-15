# Preparação local

## Pré-requisitos

- Node.js 24 (`node -v`).
- pnpm 12.11.2 — o `packageManager` do `package.json` fixa a versão; com `corepack enable` ela é baixada automaticamente.
- Git.
- PostgreSQL 15+ local ou gerenciado — só necessário quando houver fluxos com dados.
- Windows/PowerShell: se `pnpm`/`npx` forem bloqueados pela política de execução, use `pnpm.cmd`/`npx.cmd` (não é preciso alterar a política).

## Primeira execução

```bash
pnpm install
cp .env.example .env.local   # PowerShell: Copy-Item .env.example .env.local
pnpm dev                     # http://localhost:3000
```

Variáveis (`.env.example`, valores reais somente em `.env.local`, que é ignorado pelo Git):

| Variável | Uso | Onde obter |
|---|---|---|
| `DATABASE_URL` | Conexão PostgreSQL (`postgres://` ou `postgresql://`) | Banco local ou provedor autorizado |
| `DATABASE_URL_UNPOOLED` | Opcional: conexão direta para migrations | Provedor, se exigir |
| `LOG_LEVEL` | Nível do Pino (padrão `info`) | — |
| `GROQ_API_KEY` | Chave da API Groq (servidor) | Console da Groq |
| `GROQ_MODEL` | Modelo (padrão planejado `openai/gpt-oss-20b`) | — |

`GROQ_*` ainda não são lidas pelo código; entram com a integração da IA.

## Banco

1. Suba um PostgreSQL de desenvolvimento (ex.: instalação local ou `docker run --name zuck-db -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:17`).
2. Defina `DATABASE_URL=postgresql://postgres:dev@localhost:5432/postgres` em `.env.local`.
3. Depois de alterar `src/db/schema/`, rode `pnpm db:generate` e revise o SQL em `drizzle/`.
4. Aplique com `pnpm db:migrate` somente nesse banco de desenvolvimento. Nunca use produção como ambiente de teste.

Hoje o schema não tem tabelas, então `db:generate` não gera migrations.

## Verificar

```bash
pnpm check
```

Roda lint, typecheck, self-check das regras, testes e build. Não precisa de banco nem de chave da Groq. Testes que exigirem PostgreSQL real serão separados quando existirem.

## Agentes

Leia [AGENTS.md](../AGENTS.md). [CLAUDE.md](../CLAUDE.md) importa as mesmas instruções. Consulte [setup.md](setup.md) para skills locais, integrações e escopos configurados.

## Dificuldades conhecidas

- **`pnpm : ... running scripts is disabled on this system`** (PowerShell): a política de execução bloqueia `pnpm.ps1`. Use `pnpm.cmd`. Observado no bootstrap.
- **`Cannot find name 'LayoutProps'` no `tsc`**: os tipos globais de rota são gerados pelo Next. Use `pnpm typecheck`, que roda `next typegen` antes. Observado e corrigido no bootstrap.
