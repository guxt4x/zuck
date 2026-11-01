<div align="center">

  <img src="public/logo.png" alt="ZUCK — Seu Copiloto Financeiro" width="180" />

  # ZUCK — Seu Copiloto Financeiro

  **O assistente financeiro conversacional inteligente: converse naturalmente, acompanhe seu dashboard em tempo real e atinja suas metas sem planilhas ou formulários burocráticos.**

  [![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
  [![React 19](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
  [![Neon PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql&logoColor=white)](https://neon.tech/)
  [![Groq AI](https://img.shields.io/badge/Groq_AI-Tool_Calling-F55036)](https://groq.com/)
  [![Vitest](https://img.shields.io/badge/Tests-61_passed-729B1B?logo=vitest)](https://vitest.dev/)

</div>

---

## 💡 Sobre o ZUCK

Aplicativos financeiros tradicionais costumam falhar pela complexidade: categorias confusas, formulários intermináveis e telas que desmotivam o registro imediato dos gastos.

O **ZUCK** muda essa dinâmica trazendo uma **experiência conversacional direta**:
Basta enviar no chat *"Gastei 35 reais no almoço"* ou *"Recebi 3500 de salário"*, e o copiloto interpreta a intenção, extrai os valores e consolida tudo no seu painel em tempo real.

> ⚖️ **Princípio Fundamental de Domínio:**  
> **A IA não calcula dinheiro.** O modelo (Groq `openai/gpt-oss-20b`) é responsável estritamente por interpretar a linguagem natural e disparar ferramentas de backend. Todas as operações aritméticas, validações e persistências são executadas no servidor de forma **determinística**, usando **números inteiros em centavos** (`amountCents`).

---

## 🚀 Principais Funcionalidades

### 💬 Chat Conversacional com IA
- **Entendimento Natural:** Registre despesas, entradas e transferências em linguagem livre.
- **Categorização Automática:** Categorias automáticas pré-configuradas (*Alimentação, Transporte, Moradia, Lazer, Saúde, Compras, Educação, Contas, Outros*).
- **Proteção em Exclusões:** Ações destrutivas (apagar gastos ou zerar extrato) exigem confirmação explícita do usuário.
- **Fallback Determinístico:** Se a API de IA estiver indisponível ou sem chave, o sistema conta com um parser semântico local que mantém o app funcional.

### 📊 Dashboard Financeiro em Tempo Real
- **Métricas Chave:** Saldo disponível, total de entradas acumuladas e total de saídas.
- **Distribuição por Categorias:** Gráfico de barras progressivas com identificação automática do maior gargalo financeiro.
- **Extrato Recente:** Lista detalhada de transações com valores formatados em BRL e identificação visual por ícones.
- **Sincronização Reativa:** Qualquer movimentação adicionada pelo chat reflete instantaneamente no painel.

### 🎯 Metas Financeiras Inteligentes
- **Cálculo de Economia Mensal:** Ao definir uma meta com prazo (ex: *"Guardar 5000 para viagem em dezembro"*), o backend calcula automaticamente quanto poupar por mês.
- **Acompanhamento de Progresso:** Barra de progresso percentual e acompanhamento do saldo faltante.

### 🔒 Autenticação Multi-Dispositivo
- **Isolamento Completo (Multi-Tenant):** Cada usuário autenticado acessa exclusivamente seus próprios registros financeiros.
- **Criptografia Forte Nativa:** Hash de senhas via `scrypt` com salt aleatório e verificação em tempo constante (`timingSafeEqual`) usando `node:crypto`.
- **Sessões Seguras:** Cookies HTTP-Only com 30 dias de validade e renovação contínua.

### 📱 Experiência Mobile & PWA (Web App)
- **Navegação Ergonômica:** Bottom navigation bar estilo nativo (Nubank/WhatsApp) para telas touch, e header clássico em desktop.
- **Suporte a Safe Area:** Respeito integral ao notch, Dynamic Island e barra de gestos do iOS (`pb-safe`).
- **Instalável no Smartphone:** Configurado com Web App Manifest (`manifest.ts`) e `apple-touch-icon`. Ao salvar na tela de início, abre em tela cheia sem barras de navegador.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Frontend** | Next.js 16.4.1 (App Router) + React 19.3 | Turbopack, Server & Client Components, Dynamic Viewport (`100dvh`) |
| **Estilização** | Tailwind CSS v4 | Tema Pitch Black (`#09090b`) com contraste Neon Emerald (`emerald-400/500`) |
| **Linguagem** | TypeScript 5.9 | Tipagem estrita (`strict: true`), zero uso de `any` frouxo |
| **Persistência** | PostgreSQL (Neon) + Drizzle ORM | Conexão com pooling, migrations versionadas (`drizzle/`) |
| **Armazenamento Local** | In-Memory Fallback | Armazenamento isolado por usuário em caso de indisponibilidade de rede |
| **Inteligência Artificial** | Groq API (`openai/gpt-oss-20b`) | Tool calling via Function Calling nativo e schemas validados com Zod 4 |
| **Segurança & Sessão** | Node.js `node:crypto` | `scryptSync`, `timingSafeEqual`, cookies `httpOnly`, `sameSite: lax` |
| **Testes** | Vitest 5 | 61 testes automatizados (unitários, regras de negócio e integração) |
| **Qualidade & Lint** | ESLint 9 + Regras customizadas | Regra de teto de 350 linhas, bloqueio de console e acesso direto a dados |

---

## 📁 Estrutura do Projeto

```text
v1-zuck/
├── drizzle/                  # Migrações SQL geradas pelo Drizzle Kit
├── public/                   # Ícones PWA, logos e manifest
│   ├── apple-icon.png        # Ícone para iOS Safari (180x180)
│   ├── icon-192.png          # Ícone PWA Android (192x192)
│   ├── icon-512.png          # Ícone PWA Splash / Maskable (512x512)
│   ├── logo-icon.png         # Símbolo do mascote ZUCK isolado
│   └── logo.png              # Logo completa transparente
├── src/
│   ├── app/                  # Rotas do Next.js (App Router)
│   │   ├── api/
│   │   │   ├── auth/         # Endpoints de cadastro, login, logout e status (/me)
│   │   │   ├── chat/         # Processamento de IA e tool calling
│   │   │   └── dashboard/    # Agregação de saldo, categorias e metas
│   │   ├── globals.css       # Diretivas Tailwind 4 e utilitários de safe-area
│   │   ├── layout.tsx        # Layout raiz com metadados PWA e viewport
│   │   ├── manifest.ts       # Web App Manifest dinâmico
│   │   └── page.tsx          # Página principal (Dashboard + Chat alternáveis)
│   ├── components/           # Componentes modulares de apresentação
│   │   ├── auth/             # Card de autenticação moderno
│   │   ├── chat/             # Container de chat, lista de mensagens e input
│   │   └── dashboard/        # Cartões de métricas, gráficos e metas
│   ├── db/                   # Camada de banco de dados
│   │   ├── schema/           # Schemas relacionais (users, transactions, goals, sessions)
│   │   └── index.ts          # Pool de conexão PostgreSQL (singleton resiliente)
│   ├── features/             # Lógica de negócio por domínio (Clean Architecture)
│   │   ├── auth/             # Autenticação, senhas scrypt e validações
│   │   ├── goals/            # Gestão e cálculo de metas financeiras
│   │   ├── store/            # Fallback seguro de memória
│   │   └── transactions/     # Aritmética determinística em centavos e extratos
│   └── lib/                  # Utilitários compartilhados
│       ├── ai/               # Integração Groq e definições de ferramentas
│       ├── env.ts            # Validação rigorosa de ambiente via Zod
│       ├── logger.ts         # Logger estruturado via Pino (sanitização de segredos)
│       └── session.ts        # Resolução e extração de sessão segura
└── vitest.config.mts         # Configuração da suíte de testes Vitest
```

---

## ⚡ Começando

### Pré-requisitos
- **Node.js**: Versão 24.x LTS recomendada.
- **pnpm**: Versão 12.x (`corepack enable`).

### 1. Clonar o Repositório
```bash
git clone https://github.com/guxt4x/zuck.git
cd zuck
```

### 2. Instalar Dependências
```bash
pnpm install
```

### 3. Configurar as Variáveis de Ambiente
Copie o arquivo de exemplo e preencha as credenciais:
```bash
cp .env.example .env.local
```

Configuração das variáveis em `.env.local`:
```env
# Banco de Dados Neon PostgreSQL (com pooling e SSL obrigatório)
DATABASE_URL="postgresql://usuario:senha@ep-pooler.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://usuario:senha@ep.neon.tech/neondb?sslmode=require"

# Provedor de Inteligência Artificial (Groq)
GROQ_API_KEY="gsk_sua_chave_groq_aqui"
GROQ_MODEL="openai/gpt-oss-20b"

# Ambiente
NODE_ENV="development"
```

### 4. Executar Migrações do Banco
```bash
pnpm db:migrate
```

### 5. Iniciar o Servidor de Desenvolvimento
```bash
pnpm dev
```
Acesse **`http://localhost:3000`** no seu navegador.

---

## 🧪 Testes e Qualidade

O projeto conta com uma suíte de verificações automáticas para garantir estabilidade, segurança e conformidade arquitetural:

```bash
# Executa todos os 61 testes automatizados (Vitest)
pnpm test

# Executa o ESLint 9
pnpm lint

# Checagem estrita de tipos do TypeScript
pnpm typecheck

# Validação das regras de qualidade (teto de 350 linhas e fronteiras de dados)
pnpm lint:rules

# Check completo de CI (lint + types + rules + tests + build)
pnpm check
```

---

## 🚀 Deploy na Vercel

O projeto está otimizado para deploy imediato na **Vercel**:

1. Importe o repositório no dashboard da [Vercel](https://vercel.com/new).
2. Configure as seguintes **Environment Variables**:
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`
   - `GROQ_API_KEY`
   - `GROQ_MODEL`
3. Clique em **Deploy**. O build executará via Turbopack e o aplicativo estará disponível com HTTPS em segundos.

---

## 📄 Licença

Este projeto é desenvolvido sob a licença MIT. Consulte o arquivo de licença para mais detalhes.
