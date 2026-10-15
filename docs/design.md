# Design e acessibilidade

## Direção

- Público: jovens e adultos sem paciência para planilhas (ver `PRODUCT.md`). Idioma: português do Brasil; moeda BRL formatada com `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
- Dispositivo principal: celular (registro no momento do gasto); desktop também suportado.
- Tom: direto, amigável e sem jargão financeiro. Função antes de complexidade visual.
- Layout: tela de chat conversacional em tela cheia, com histórico rolável centralizado, atalhos no estado vazio e campo de texto fixo no rodapé.

## Sistema existente

- Tailwind 4 com `src/app/globals.css` gerado pelo Next (variáveis `--background`/`--foreground`, tema claro/escuro via `prefers-color-scheme`).
- Fontes: Geist e Geist Mono (`next/font/google`) em `src/app/layout.tsx`.
- Helper `cn()` em `src/lib/utils.ts`.
- Componentes do chat em `src/components/chat/` (`chat-container.tsx`, `chat-messages.tsx`, `chat-input.tsx`, `types.ts`).

## Interação

Use HTML semântico, navegação por teclado, foco visível e contraste adequado. Dê nome a controles e campos. Erros de validação ficam junto do campo; operações assíncronas exibem espera e resultado. Respeite movimento reduzido.

Para o chat:

- Campo de mensagem com `<label>` (`sr-only`); Enter envia, Shift+Enter quebra linha.
- Enquanto a IA responde: indicador de espera com animação, botão desabilitado e proteção contra envio duplicado.
- Novas mensagens anunciadas a leitores de tela (`aria-live="polite"` na lista).
- Confirmações de ações destrutivas aparecem como pergunta explícita na conversa.
- Valores negativos/positivos não dependem só de cor (use sinal e texto).

## Layout e revisão

- Mobile first; conteúdo central com largura máxima legível (`max-w-2xl`) em telas grandes.
- Estados cobertos no chat: vazio (sugestões de exemplo como "Gastei 35 reais no almoço", "Recebi 2500 de salário"), carregando (pulsing dots e disabled button), e tratamento de erro de rede amigável.
- Revisão de interface: tela principal implementada em `src/app/page.tsx` com cabeçalho limpo e chat responsivo.

## Manutenção

Mudanças visuais e de interação atualizam a fonte de tokens/componentes e esta orientação quando houver alteração de regra. Use a skill `web-design-guidelines` ao revisar telas.
