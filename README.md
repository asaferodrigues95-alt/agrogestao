# AgroGestão — Controle Financeiro e de Estoque

PWA completo para controle financeiro, estoque, compras, vendas, relatórios e backup
de uma feira livre, produtor rural ou hortifruti. Funciona 100% offline (IndexedDB), é instalável no celular e no
computador, e está pronto para uso imediato.

> 📐 **Arquitetura**: a partir da Fase 0 de revisão arquitetural, o projeto passou a
> seguir uma organização em camadas (Clean Architecture simplificado). Veja o
> relatório completo da auditoria, as decisões técnicas e a estrutura detalhada em
> [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Estrutura de pastas (visão geral)

```
feira-app/
├─ public/
│  └─ icons/                    → ícones do PWA (192, 512, maskable)
├─ src/
│  ├─ app/                      → composição da aplicação
│  │  ├─ App.tsx                    (Router + Layout)
│  │  └─ routes.tsx                 (junta nav-items + páginas das features)
│  ├─ core/                     → DOMÍNIO (regras de negócio puras, sem framework)
│  │  ├─ entities/index.ts          (tipos: Entrada, Saida, Produto, Venda...)
│  │  └─ calculations/               (cálculos de dashboard/relatórios)
│  ├─ data/                     → INFRAESTRUTURA (acesso a dados)
│  │  ├─ local-database.ts          (schema do Dexie/IndexedDB)
│  │  ├─ backup.service.ts          (exportar/importar/limpar backup)
│  │  └─ repositories/               (1 arquivo por entidade: entradas, saidas,
│  │                                  produtos, fornecedores, compras, vendas,
│  │                                  estoque, settings + index.ts barrel)
│  ├─ features/                 → APRESENTAÇÃO, agrupada por funcionalidade
│  │  ├─ dashboard/    (Dashboard.page.tsx + components/StatCard.tsx)
│  │  ├─ financeiro/   (Financeiro.page.tsx + components/LancamentoModal.tsx)
│  │  ├─ estoque/      (Estoque.page.tsx + components/{Produto,Compra,Venda,Ajuste}Modal.tsx, ProdutoCard.tsx)
│  │  ├─ historico/    (Historico.page.tsx)
│  │  ├─ relatorios/   (Relatorios.page.tsx + components/ChartCard.tsx)
│  │  └─ config/       (Config.page.tsx)
│  ├─ shared/                   → kit de UI e utilitários cross-cutting
│  │  ├─ ui/            (Button, Card, Modal, Fields, Misc, icons)
│  │  ├─ layout/         (Layout, PageHeader, nav-items.ts)
│  │  ├─ contexts/        (ThemeContext)
│  │  └─ utils/            (format.ts, datetime.ts)
│  ├─ main.tsx                  → bootstrap da aplicação + registro do service worker
│  └─ index.css
├─ vite.config.ts               → Vite + plugin PWA + aliases (@core, @data, @features, @shared, @app)
├─ tailwind.config.js           → paleta de cores "Feira" e tipografia
└─ package.json
```

Imports entre camadas usam aliases dedicados (`@core/...`, `@data/...`,
`@features/...`, `@shared/...`, `@app/...`) em vez de caminhos relativos longos
(`../../../`), tornando a origem de cada import explícita e resistente a
mudanças de localização de arquivo.


### Como os dados se conectam

- **Comprar mercadoria** (tela Estoque → "Registrar compra"): gera automaticamente
  uma **Saída financeira**, aumenta a **quantidade em estoque** e recalcula o
  **custo médio ponderado** do produto.
- **Vender mercadoria** (tela Estoque → "Registrar venda"): gera automaticamente
  uma **Entrada financeira**, dá baixa no **estoque** e calcula o **lucro da venda**
  (preço de venda − custo médio).
- **Ajustar estoque**: usado para perdas, quebras ou correções de contagem — não
  gera lançamento financeiro.
- Excluir uma compra ou venda no **Histórico** reverte automaticamente o estoque e
  remove o lançamento financeiro vinculado.

Todos os dados (entradas, saídas, produtos, compras, vendas, fornecedores,
configurações) ficam salvos no **IndexedDB do navegador**, ou seja, no próprio
celular ou computador — nada é enviado para nenhum servidor. Isso garante
funcionamento 100% offline.

### Preparado para expansão futura

- Cada registro tem `id` (UUID) e `createdAt`, prontos para uma futura sincronização
  com backend (basta adicionar campos como `updatedAt`/`syncStatus` e uma fila de
  sincronização em `src/db`).
- A camada `data/repositories/` isola toda a lógica de negócio: trocar o armazenamento
  local por uma API remota exigiria alterar apenas esse arquivo, não as telas.
- Estrutura pronta para múltiplos usuários: bastaria adicionar um campo `usuarioId`
  aos registros e um contexto de autenticação.
- Contas a pagar/receber podem ser adicionadas como uma nova tabela `contas` com
  status (pendente/pago) e vencimento, reaproveitando os componentes de UI já
  existentes (Modal, Input, Card, ConfirmDialog).

---

## 1. Executar o projeto localmente

Pré-requisitos: [Node.js](https://nodejs.org) 18 ou superior instalado.

```bash
# 1. Entrar na pasta do projeto
cd feira-app

# 2. Instalar as dependências
npm install

# 3. Rodar em modo desenvolvimento
npm run dev
```

O terminal vai mostrar um endereço como `http://localhost:5173`. Abra no navegador
do computador, ou no celular (mesma rede Wi-Fi) usando o endereço de rede local que
também aparece no terminal (algo como `http://192.168.0.10:5173`).

## 2. Gerar a versão de produção

```bash
npm run build
```

Isso cria a pasta `dist/` com os arquivos otimizados (HTML, JS, CSS, service worker
e manifesto do PWA), prontos para publicação em qualquer hospedagem estática.

Para testar a versão de produção localmente antes de publicar:

```bash
npm run preview
```

## 3. Publicar gratuitamente no Vercel

**Opção A — pelo site (mais simples, sem usar terminal):**

1. Crie uma conta gratuita em [vercel.com](https://vercel.com) (pode entrar com
   GitHub, GitLab ou e-mail).
2. Suba a pasta do projeto para um repositório no GitHub (crie um repositório novo
   e envie os arquivos — pode usar o GitHub Desktop se preferir não usar comandos).
3. No painel da Vercel, clique em **"Add New" → "Project"**, selecione o
   repositório e clique em **"Deploy"**. A Vercel detecta automaticamente que é um
   projeto Vite e configura tudo sozinha.
4. Em poucos minutos você recebe uma URL pública gratuita (ex:
   `coluna-forte.vercel.app`), já com HTTPS — necessário para o PWA funcionar e
   ser instalável.

**Opção B — pelo terminal (CLI da Vercel):**

```bash
npm install -g vercel
vercel login
vercel --prod
```

Siga as instruções no terminal (confirmar a pasta do projeto, nome do projeto,
etc.). Ao final, a Vercel imprime a URL pública.

> O arquivo `vercel.json` incluído no projeto garante que todas as rotas do app
> carreguem corretamente (fallback para `index.html`).

## 4. Instalar o PWA

### No Android (Chrome)

1. Abra a URL do app publicado no Chrome.
2. Toque no menu (⋮) no canto superior direito.
3. Toque em **"Instalar aplicativo"** (ou "Adicionar à tela inicial").
4. Confirme — o ícone do app aparece na tela inicial e abre em tela cheia, sem
   barra de endereço, como um aplicativo nativo.

### No computador (Chrome, Edge ou Brave)

1. Abra a URL do app publicado.
2. Clique no ícone de instalação que aparece à direita da barra de endereço
   (ícone de "tela com uma seta" ou "+"), ou vá em menu (⋮) → **"Instalar
   [nome do app]..."**.
3. Confirme — o app abre em sua própria janela e ganha um atalho no menu
   iniciar/dock, exatamente como um programa instalado.

### iPhone/iPad (Safari)

1. Abra a URL do app no Safari.
2. Toque no ícone de compartilhar (quadrado com seta para cima).
3. Toque em **"Adicionar à Tela de Início"**.

Depois de instalado, o app funciona totalmente offline: você pode registrar
vendas, compras, entradas e saídas mesmo sem internet na feira, e os dados ficam
salvos no dispositivo. Recomenda-se exportar um backup (tela **Ajustes → Exportar
backup**) periodicamente, guardando o arquivo `.json` em um local seguro (e-mail,
Google Drive, WhatsApp para si mesmo, etc.).
