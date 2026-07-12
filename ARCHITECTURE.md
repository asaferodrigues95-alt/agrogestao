# Arquitetura do Projeto — AgroGestão

Documento da **Fase 0 (Arquitetura, Padronização e Preparação)**. Nenhuma
funcionalidade nova foi adicionada nesta fase — apenas reorganização,
padronização e documentação. Todo o comportamento do app permanece o mesmo
para quem usa (zero regressões).

---

## 1. Relatório da auditoria

Auditoria feita sobre o projeto tal como estava antes desta fase (estrutura
"por tipo técnico": `pages/`, `components/`, `db/`, `utils/`, `types/`).

### 🔴 Crítico

| # | Problema | Por quê é crítico |
|---|----------|-------------------|
| 1 | `db/repositories.ts` era um único arquivo com **201 linhas** concentrando as regras de negócio de **7 entidades diferentes** (entradas, saídas, produtos, fornecedores, compras, vendas, ajustes de estoque). | Viola o Princípio da Responsabilidade Única (SRP). Qualquer alteração em "vendas" tinha risco de conflito de edição/merge com "compras" ou "produtos" no mesmo arquivo. Ficaria insustentável ao adicionar contas a pagar/receber, clientes, etc. |
| 2 | `db/database.ts` misturava **definição de schema** (infraestrutura pura) com **regra de negócio** (`ensureSettings()`, que decide os valores padrão de categorias). | Schema de banco deveria ser "burro" (só estrutura). Regra de negócio embutida ali dificulta testar e reaproveitar essa lógica se o banco mudar (ex.: para um backend remoto). |
| 3 | Páginas e componentes importavam `db` (Dexie) diretamente para leituras (`db.entradas.toArray()`) em vez de passar por uma camada de repositório. | Sem uma fronteira clara entre "apresentação" e "dados", qualquer tela pode rodar qualquer query — dificulta auditar o que cada tela realmente faz e dificulta trocar o mecanismo de armazenamento no futuro. **Parcialmente corrigido nesta fase** (escritas de configurações agora passam por `updateSettings()`); leituras via `useLiveQuery` continuam diretas — ver seção 5 (Fase 1). |
| 4 | A lista de rotas existia **duplicada**: uma vez em `App.tsx` (as `<Route>`) e outra em `Layout.tsx` (os itens do menu), sem nenhuma fonte única. | Um problema clássico de DRY: ao adicionar uma tela nova, é fácil esquecer de atualizar um dos dois lugares e o menu ficar dessincronizado da navegação real. |

### 🟠 Médio

| # | Problema | Por quê é médio |
|---|----------|-------------------|
| 5 | Estrutura de pastas organizada **por tipo técnico** (`pages/`, `components/ui`, `components/estoque`...) em vez de **por funcionalidade**. | Funciona para um app pequeno, mas não escala: para entender tudo sobre "Estoque" era preciso abrir `pages/Estoque.tsx` + 5 arquivos espalhados em `components/estoque/`. Em um projeto de anos, com múltiplos módulos (clientes, contas a pagar, etc.), isso vira uma pasta `components/` com dezenas de subpastas. |
| 6 | Tipos de domínio (`types/index.ts`) e cálculos de negócio (`utils/aggregations.ts`) viviam em pastas genéricas de "utilitário", sem relação conceitual explícita com o restante do domínio. | Um novo desenvolvedor não tem como adivinhar, pelo nome da pasta, que ali mora a regra de negócio mais importante do sistema (cálculo de caixa, custo médio, margem). |
| 7 | Imports relativos profundos (`../../db/repositories`, `../../types`, `../../../utils/format`). | Frágeis a qualquer mudança de local de arquivo — e, de fato, quebrariam **todos** nesta própria reorganização se não tivéssemos usado aliases. Também dificultam a leitura ("de onde vem isso mesmo?"). |
| 8 | `deleteCompra()` reverte a quantidade em estoque, mas **não recalcula o custo médio ponderado** do produto. | Não é um problema de arquitetura, é uma regra de negócio incompleta que já existia. Documentado e **mantido como estava** (zero regressão) — ver sugestão na seção 5. |

### 🟢 Baixo

| # | Problema | Por quê é baixo |
|---|----------|-------------------|
| 9 | Vários botões que continham apenas um ícone (editar, excluir, alternar tema) não tinham `aria-label`, prejudicando leitores de tela. | Não impede o uso do app, mas é uma barreira de acessibilidade real. **Corrigido nesta fase** (adição de atributos, sem mudança de comportamento). |
| 10 | Ausência de testes automatizados (unitários ou de integração). | Aceitável no estágio atual do produto, mas vira dívida técnica conforme o domínio cresce (compras/vendas com efeitos colaterais em cascata são exatamente o tipo de lógica que mais se beneficia de testes). |
| 11 | Nenhuma padronização explícita de nomenclatura de arquivos (`Dashboard.tsx` vs. `LancamentoModal.tsx` vs. `database.ts`). | Já era relativamente consistente, mas sem uma convenção documentada, tende a divergir conforme mais pessoas mexem no código. |

---

## 2. Melhorias realizadas nesta fase

1. **Separação em camadas (Clean Architecture simplificado)**: `core` (domínio) → `data` (infraestrutura) → `features` (apresentação), com `shared` para o que é reaproveitado por todas as camadas de apresentação. Ver justificativa técnica na seção 3.
2. **Divisão do "God file" de repositórios** em 8 arquivos, um por entidade/caso de uso (`entradas`, `saidas`, `fornecedores`, `produtos`, `estoque`, `compras`, `vendas`, `settings`), todos acessíveis por um único barrel (`data/repositories/index.ts`).
3. **Separação do schema do banco (`local-database.ts`) das regras de negócio** (agora em `settings.repository.ts` e nos demais repositórios).
4. **Eliminação da duplicação de rotas**: `shared/layout/nav-items.ts` é a única fonte de verdade dos itens de navegação (path, label, ícone); `app/routes.tsx` combina esses metadados com as páginas das features para montar o `<Router>`. `Layout.tsx` e `App.tsx` agora **não podem** ficar dessincronizados.
5. **Aliases de import por camada** (`@core/*`, `@data/*`, `@features/*`, `@shared/*`, `@app/*`) configurados tanto no `tsconfig.json` quanto no `vite.config.ts`, substituindo os imports relativos profundos.
6. **Reorganização por feature**: cada módulo (`dashboard`, `financeiro`, `estoque`, `historico`, `relatorios`, `config`) agora tem sua própria pasta com a página e os componentes que só ela usa. Componentes verdadeiramente genéricos (Button, Card, Modal, ícones, layout) ficam em `shared/`.
7. **Correção pontual de acoplamento**: `Config.page.tsx` e `ThemeContext.tsx` chamavam `db.settings.update(...)` diretamente; agora chamam `updateSettings(...)` do repositório de settings.
8. **Acessibilidade**: `aria-label` adicionado em todos os botões somente-ícone identificados (editar, excluir, alternar tema) nas telas de Financeiro, Estoque, Histórico e Config.
9. **Documentação**: este arquivo (`ARCHITECTURE.md`) e a seção de estrutura de pastas do `README.md` atualizada para refletir a nova organização.

Todas as mudanças acima são de **reorganização/padronização** — nenhuma regra de negócio, cálculo, rota ou comportamento visível ao usuário foi alterado.

---

## 3. Estrutura final das pastas

```
src/
├─ app/                         # Camada de COMPOSIÇÃO
│  ├─ App.tsx                       Router + Layout
│  └─ routes.tsx                    combina nav-items (shared) + páginas (features)
│
├─ core/                        # Camada de DOMÍNIO (regras de negócio puras)
│  ├─ entities/index.ts             tipos: Entrada, Saida, Produto, Compra, Venda...
│  └─ calculations/
│     └─ business-calculations.ts   cálculos de caixa, estoque, rankings, séries mensais
│
├─ data/                        # Camada de INFRAESTRUTURA (acesso a dados)
│  ├─ local-database.ts             schema Dexie/IndexedDB (só estrutura)
│  ├─ backup.service.ts             exportar/importar/limpar backup (JSON)
│  └─ repositories/
│     ├─ entradas.repository.ts
│     ├─ saidas.repository.ts
│     ├─ fornecedores.repository.ts
│     ├─ produtos.repository.ts
│     ├─ estoque.repository.ts      ajustes manuais de estoque
│     ├─ compras.repository.ts      compra → saída financeira + custo médio
│     ├─ vendas.repository.ts       venda → entrada financeira + lucro
│     ├─ settings.repository.ts     configurações (tema, categorias, caixa inicial)
│     └─ index.ts                   barrel — ponto único de acesso à camada de dados
│
├─ features/                    # Camada de APRESENTAÇÃO, por funcionalidade
│  ├─ dashboard/
│  │  ├─ Dashboard.page.tsx
│  │  └─ components/StatCard.tsx
│  ├─ financeiro/
│  │  ├─ Financeiro.page.tsx
│  │  └─ components/LancamentoModal.tsx
│  ├─ estoque/
│  │  ├─ Estoque.page.tsx
│  │  └─ components/ (ProdutoModal, CompraModal, VendaModal, AjusteEstoqueModal, ProdutoCard)
│  ├─ historico/
│  │  └─ Historico.page.tsx
│  ├─ relatorios/
│  │  ├─ Relatorios.page.tsx
│  │  └─ components/ChartCard.tsx
│  └─ config/
│     └─ Config.page.tsx
│
├─ shared/                      # Reutilizável por qualquer camada de apresentação
│  ├─ ui/                           Button, Card, Modal, Fields, Misc, icons
│  ├─ layout/                       Layout, PageHeader, nav-items.ts
│  ├─ contexts/                     ThemeContext
│  └─ utils/                        format.ts, datetime.ts
│
├─ main.tsx                     # Entry point (composition root)
├─ index.css
└─ vite-env.d.ts
```

### Regra de dependência (por que cada coisa está onde está)

```
app  ──depende de──▶  features  ──depende de──▶  core
 │                        │                        ▲
 │                        └──depende de──▶ shared ──┘
 └────────────────────depende de──▶ data ──depende de──▶ core
```

- **`core`** não depende de mais nada (nem de React, nem do Dexie) — são tipos e
  funções puras. É a camada mais estável do projeto.
- **`data`** depende de `core` (usa os tipos) e do Dexie, mas nunca de `features`
  ou `app`.
- **`shared`** depende de `core` (tipos) quando necessário, mas nunca de
  `features` ou `app` — por isso os metadados de navegação (`nav-items.ts`)
  ficam em `shared`, e não em `app`: o `Layout` (shared) não pode depender da
  camada de composição.
- **`features`** depende de `core`, `data` e `shared` — nunca de `app`, e uma
  feature só importa de outra através de um caminho explícito
  (`@features/financeiro/...`), nunca por acaso.
- **`app`** é o único lugar que conhece tudo ao mesmo tempo — é a camada de
  composição, o topo da árvore de dependências.

---

## 4. Justificativa técnica de cada alteração

- **Por que separar `core` de `data`?** Regras de negócio "puras" (ex.: "estoque
  baixo é quando quantidade ≤ mínimo", "lucro é venda menos custo médio") não
  deveriam saber que existe um Dexie ou um IndexedDB por trás. Isso permite, no
  futuro, testar essas regras sem precisar de um banco de dados real, e trocar
  o mecanismo de persistência (ex.: para uma API remota) sem tocar em `core`.
- **Por que dividir os repositórios por entidade?** Cada arquivo agora cabe
  inteiro na tela, tem um único motivo para mudar (SRP) e reduz conflitos de
  edição quando mais de uma pessoa mexe no projeto ao mesmo tempo.
- **Por que features em vez de pastas por tipo técnico?** Ao adicionar "Contas
  a Pagar" no futuro, basta criar `features/contas-a-pagar/` com sua página e
  seus componentes — sem precisar tocar em `pages/`, `components/x`,
  `components/y` espalhados.
- **Por que aliases de import?** Além de deixar o código mais legível, eles
  tornam a arquitetura "auto-documentada": ao ler `import { db } from
  '@data/repositories'`, fica óbvio de qual camada aquilo vem. Também facilita,
  no futuro, configurar regras de lint que *proíbam* uma camada interna (`core`)
  de importar de uma camada externa (`features`), prevenindo violações da regra
  de dependência.
- **Por que `nav-items.ts` em `shared` e não em `app`?** Foi a correção mais
  sutil desta fase: a primeira tentativa colocou a lista de rotas em `app/`,
  mas isso forçaria o `Layout` (que é `shared`, reutilizável) a importar de
  `app` (a camada mais externa) — invertendo a direção de dependência. A
  solução foi separar os *metadados* de navegação (puros, sem depender de
  páginas) dos *componentes de página* em si.

---

## 5. Sugestões para a Fase 1 (Correção de Bugs) — **não implementadas nesta fase**

Itens identificados na auditoria que envolvem mudança de comportamento (por
isso não foram tocados agora, conforme escopo desta fase):

1. **Custo médio não recalculado ao excluir uma compra.** Hoje, excluir uma
   compra devolve a quantidade ao estoque, mas mantém o `precoCompra` (custo
   médio) como estava — ou seja, o custo fica "contaminado" pela compra já
   excluída. Duas soluções possíveis: (a) recalcular o custo médio a partir do
   histórico de compras restante, ou (b) bloquear a exclusão de compras
   antigas e oferecer apenas "estorno" como nova compra negativa.
2. **Leituras diretas ao banco nas telas (`useLiveQuery(() => db.x.toArray())`).**
   Nesta fase, apenas as escritas de `settings` foram migradas para passar
   pelo repositório. Para fechar completamente a fronteira entre apresentação
   e dados, o ideal é criar hooks de leitura por entidade (ex.:
   `useEntradas()`, `useProdutos()`) dentro de `data/repositories/`, e fazer as
   páginas consumirem esses hooks em vez de `db` diretamente.
3. **Validação de formulários é feita "no clique de salvar"**, sem feedback
   inline enquanto o usuário digita (ex.: preço negativo, quantidade maior que
   o estoque só é avisado depois de tentar salvar). Bom candidato a melhoria
   de UX na Fase 1.
4. **Ausência de testes automatizados** para as regras de negócio mais
   sensíveis (`registrarCompra`, `registrarVenda`, `ajustarEstoque`, e as
   funções de reversão `deleteCompra`/`deleteVenda`) — são exatamente essas
   funções que mexem em múltiplas tabelas ao mesmo tempo e mais se beneficiam
   de testes automatizados antes de qualquer bugfix.
5. **Sem tratamento de erro visível ao usuário** quando uma operação do
   IndexedDB falha (ex.: quota do navegador excedida). Hoje os `try/catch`
   existentes tratam erros de regra de negócio (ex.: "estoque insuficiente"),
   mas não erros de infraestrutura.
6. **Categorias duplicadas**: nada impede cadastrar duas categorias com o
   mesmo nome (ou nomes que só diferem em maiúscula/minúscula) em Ajustes.
7. **Sem paginação/virtualização no Histórico.** Para uma feira com anos de
   uso, a lista pode crescer muito; vale considerar paginação ou carregamento
   incremental antes que a performance de renderização seja afetada.

Nenhum desses itens foi corrigido nesta fase — ficam registrados para
priorização na Fase 1, conforme solicitado.
