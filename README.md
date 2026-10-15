# ZUCK — Seu copiloto financeiro

Assistente financeiro pessoal conversacional: você escreve "Gastei 35 reais no almoço" e o ZUCK registra, calcula e responde com base nos seus dados reais — sem planilhas nem formulários. Feito para quem quer controlar entradas e saídas, economizar e atingir metas, mas não tem paciência para apps financeiros tradicionais. Detalhes em [PRODUCT.md](PRODUCT.md).

> Estado atual: base técnica configurada (bootstrap). O chat, o schema financeiro e a integração com a Groq ainda não foram implementados.

## Executar

Pré-requisitos: Node.js 24 e pnpm 12 (via Corepack: `corepack enable`).

```bash
pnpm install
cp .env.example .env.local   # preencha DATABASE_URL e GROQ_API_KEY quando forem usados
pnpm dev                     # http://localhost:3000
pnpm check                   # lint, tipos, regras locais, testes e build (sem credenciais)
```

No PowerShell com execução de scripts bloqueada, use `pnpm.cmd` e `npx.cmd`.

Banco: PostgreSQL acessível por `DATABASE_URL` (necessário somente quando houver fluxos com dados). IA: chave da Groq em `GROQ_API_KEY`. Nenhum dos dois é exigido para `pnpm check`.

## Documentação

- [Produto e escopo](PRODUCT.md).
- [Preparação local](docs/onboarding.md).
- [Estrutura e decisões técnicas](docs/architecture.md).
- [Design e acessibilidade](docs/design.md).
- [Checks de qualidade](docs/quality.md).
- [Instruções para agentes](AGENTS.md).
- [Setup e evidências](docs/setup.md).

## Próxima entrega

Modelar usuários, movimentações (em centavos), categorias fixas e metas no schema Drizzle e implementar `registrar_despesa`, `registrar_receita` e `consultar_saldo` como funções de servidor validadas com Zod e testadas com Vitest. Critério: os testes provam que valores e saldos são calculados corretamente e isolados por usuário. Pendências externas: `DATABASE_URL`, `GROQ_API_KEY` e escolha da biblioteca de autenticação.
