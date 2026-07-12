# Validação de Produto — AgroGestão (Fase 0.5)

Análise feita pensando em como um pequeno produtor rural ou feirante — muitas
vezes com pouca intimidade com tecnologia — usaria o app num dia real de
trabalho, das 5h30 da manhã até o fim da feira. Nenhuma arquitetura foi
alterada; as poucas mudanças de interface descritas na Etapa 7 preservam 100%
do comportamento e das funcionalidades já existentes.

---

## Etapa 1 — Mapeamento das dores

Dores reais de quem vive da roça ou da feira, na ordem em que costumam doer mais:

1. **"Não sei se ganhei ou perdi dinheiro hoje."** — sem separar entradas e
   saídas, o produtor só "sente" se sobrou dinheiro no bolso, sem saber o motivo.
2. **"Misturo o dinheiro da produção com o dinheiro de casa."** — sem um caixa
   separado, é impossível saber o que é lucro de verdade e o que é reposição de gasto pessoal.
3. **"Não sei quanto me custa 1 kg do que eu vendo."** — sem custo por produto,
   um preço "que parece bom" pode estar dando prejuízo sem o produtor perceber.
4. **"Não sei qual produto dá mais lucro."** — produz/vende vários itens (banana,
   manga, tomate...) mas decide o que plantar/comprar mais "no feeling".
5. **"Esqueço quem me deve e quem eu devo."** — fiado é comum na feira e em
   vendas para vizinhos; sem registro, vira desentendimento.
6. **"Não sei quando o estoque vai acabar."** — descobre que faltou produto só
   na hora de vender, ou compra a mais e perde mercadoria (principalmente perecíveis).
7. **"Esqueço de pagar contas"** (frete, insumo, manutenção) — sem lembrete,
   vira multa ou corte de fornecimento.
8. **"Não confio em anotar num caderno"** — caderno molha, rasga, se perde; e
   fazer conta de cabeça no fim do dia cansado é fonte de erro.
9. **"Tenho vergonha/medo de sistema complicado"** — já tentou outro app ou
   planilha e desistiu porque tinha campo demais ou português técnico demais.
10. **"Preciso saber tudo rápido, no meio da feira, sem tempo de estudar a tela."**

> A dor #5 (fiado/contas a receber) **não existe hoje no sistema** — é a
> ausência mais sentida pelo público-alvo real. Está no roadmap (Etapa 8).

---

## Etapa 2 — Jornada do usuário (5 perfis)

### 🍅 Produtor de tomate
5h30, antes de ir para a roça, ele quer saber: *"o que preciso comprar hoje
(adubo, embalagem) e quanto ainda tenho de tomate estocado?"* → abre o **Painel**,
vê "Estoque baixo" já no topo, sem precisar procurar. Ao voltar da colheita,
registra a colheita como **entrada de estoque** (Ajustar → Adicionar) — não é
uma compra, é produção própria; hoje isso já funciona bem via "Ajustar estoque",
mas o rótulo antes era confuso (corrigido nesta fase — ver Etapa 7).

### 🥬 Horticultor (hortaliças diversas, muitos itens diferentes)
Ele lida com 10-15 produtos diferentes. Maior dor: **achar o produto certo
rápido**. A busca e os filtros por categoria já existem em Estoque — bom. Ponto
de atenção: cadastrar 15 produtos manualmente da primeira vez é uma barreira de
entrada (ver Etapa 4, item 🟠 "cadastro rápido em lote").

### 🍌 Produtor de banana
Vende em grandes lotes, poucas vezes por semana (não é venda diária como
feira). Ele usa mais os **Relatórios** (mensal) do que o dia a dia do Painel.
Jornada tranquila hoje: Estoque → Registrar venda → confere lucro estimado
antes de confirmar (recurso que já existe e é muito valorizado por esse perfil,
pois ele vende em quantidade e qualquer erro de preço pesa muito).

### 🧺 Feirante (o perfil mais sensível a cliques e velocidade)
Durante a feira, ele vende a cada 2-3 minutos, com fila de cliente esperando.
**Este é o perfil mais crítico da auditoria**: antes desta fase, para vender
ele precisava (1) abrir o app, (2) tocar em "Estoque" — nome que não sugere
"vender" — (3) achar o botão "Registrar venda". Três passos com o cliente
esperando. **Corrigido nesta fase**: agora o Painel tem um botão grande
"Vender" que já abre a tela certa direto no formulário (ver Etapa 7).

### 🏪 Pequeno comerciante rural
Compra de vários produtores para revender. Maior uso: **Compras** (para
registrar o que entrou) e **Relatórios → margem de lucro** (para decidir o
que vale a pena continuar revendendo). Fluxo já atende bem; ponto de melhoria
futuro é permitir múltiplos fornecedores por compra (hoje é um por compra).

---

## Etapa 3 — Avaliação de UX (estado atual)

| Critério | Situação | Nota |
|---|---|---|
| Cliques para a ação mais comum (vender) | 3 → **2** após a correção desta fase | 🟠→🟢 |
| Clareza dos nomes de menu | "Estoque" não comunica "vender/comprar" para quem não é técnico | 🟠 (mitigado com atalho no Painel; nome do menu mantido para não confundir quem já aprendeu) |
| Tamanho dos botões | Botões principais já têm bom tamanho de toque (py-2.5 a py-3.5) | 🟢 |
| Teclado numérico em valores/quantidades | Já usa `inputMode="decimal"` em todos os campos de valor | 🟢 |
| Linguagem técnica | "custo médio ponderado" e "gera entrada financeira" apareciam em avisos de tela | 🔴 → corrigido nesta fase para linguagem simples |
| Botão sem texto (só ícone ambíguo) | "Ajustar estoque" era 2 setas sobrepostas sem palavra nenhuma | 🔴 → corrigido nesta fase (agora tem a palavra "Ajustar") |
| Acessibilidade (leitor de tela) | Botões só-ícone sem `aria-label` | Corrigido na fase anterior |
| Uso em Android | Interface já responsiva, navegação inferior de 5 abas (padrão Android/iOS) | 🟢 |
| Modo escuro | Já implementado, útil para uso de madrugada/noite | 🟢 |
| Campos desnecessários | Formulários enxutos (só o essencial); nenhum campo obrigatório supérfluo identificado | 🟢 |

---

## Etapa 4 — Melhorias de produto priorizadas

### 🔴 Essencial (maior dor, maior impacto)
1. **"Fiado" / Contas a Receber e a Pagar.** Resolve a dor #5 e #7, as mais
   citadas por feirantes e produtores. Sem isso, quem usa fiado continua
   precisando de um caderno paralelo — o que compromete a adoção do app inteiro.
2. **Lembretes de pagamento** (reaproveitando o recurso de alarme já disponível
   no ambiente do app) para contas fixas (ex.: financiamento, parcela de insumo).
3. **Atalho "Vender" a 1 toque do Painel** — implementado nesta fase.

### 🟠 Importante
4. **Cadastro rápido de produtos em lote** (ex.: colar uma lista de nomes e
   já criar os produtos com valores padrão para editar depois) — reduz a
   barreira de entrada do horticultor com 15 itens.
5. **Resumo de voz/áudio do dia** ("hoje você vendeu X, o lucro foi Y") — para
   quem tem dificuldade de leitura, ouvir o resumo é mais acessível que ler
   números e gráficos.
6. **Exportar relatório simples em PDF/imagem para enviar por WhatsApp** — o
   produtor frequentemente presta contas informalmente para a família/sindicato;
   hoje só existe backup em JSON (técnico demais para esse fim).

### 🟢 Futuro
7. **Modo "venda por peso na balança"** (leitura via Bluetooth de balança) — alto
   valor para quem vende hortifruti a granel, mas depende de hardware externo.
8. **Multiusuário/permissões** (ex.: um ajudante de feira registrando vendas,
   sem acesso a excluir dados) — necessário só quando o negócio cresce além de
   uma pessoa.
9. **Sincronização em nuvem** — importante para não perder dados se o celular
   quebrar, mas não é bloqueio para o uso inicial (o backup manual já cobre isso).

---

## Etapa 5 — Diferenciais competitivos

O que faria um produtor dizer *"esse aplicativo foi feito para mim"*:

- **Categorias já vêm com Coco, Banana, Manga, Limão, Tomate** — a maioria dos
  apps financeiros genéricos tem "Alimentação", "Transporte", "Lazer": categorias
  urbanas que não fazem sentido pra quem vive da roça. Isso já existe e é um
  diferencial forte — poucos concorrentes genéricos (ex.: apps de controle
  financeiro pessoal) pensam nisso.
- **Funciona 100% sem internet.** Na roça e em muitas feiras do interior o sinal
  é ruim ou inexistente — um sistema que depende de internet simplesmente não
  seria usado. Isso já é real no app.
- **Lucro calculado automaticamente por venda**, sem o produtor precisar saber
  o que é "margem" ou fazer conta — o app já mostra "lucro estimado" antes de
  confirmar a venda.
- **Preço para instalar e usar é zero de fricção**: não pede cartão de crédito,
  não exige criar conta, não depende de aprovação de ninguém.
- Sugestão futura de diferencial: **frases e tom de voz no "jeito roça"** em vez
  de jargão corporativo (ex.: já ajustado nesta fase: "atualiza sozinho o preço
  de custo" em vez de "recalcula o custo médio ponderado").

---

## Etapa 6 — Identidade do produto

**Sobre o nome "AgroGestão":** é claro, profissional e já comunica bem o
propósito (agro + gestão). Ponto fraco: soa um pouco "corporativo/ERP", o que
pode intimidar um pequeno produtor que não se vê como "empresário". Alternativas
mais próximas da linguagem do público, para considerar:

| Nome | Tom | Observação |
|---|---|---|
| **AgroGestão** (atual) | Profissional, direto | Bom se a visão é atender também comerciantes/cooperativas maiores |
| **Roça Certa** | Caloroso, popular | Comunica "acerto de contas" e identidade rural ao mesmo tempo |
| **Feira Fácil** | Simples, direto ao público de feira | Menos abrangente para quem não é feirante |
| **Colheita Certa** | Rural, positivo | Bom gancho de marketing ("colha os frutos do seu trabalho") |

**Recomendação:** manter **AgroGestão** como nome técnico/institucional (já
implementado no manifest do PWA), mas considerar um nome popular ("Roça
Certa", por exemplo) como *apelido de marca* nas redes sociais e no material
de divulgação — semelhante ao que já é feito com "Coluna Forte na Roça" para o
conteúdo de fisioterapia. São públicos e contextos diferentes; o nome técnico
do app não precisa ser o nome "quente" de marketing.

**Público-alvo:** pequenos produtores rurais e feirantes com pouca ou nenhuma
experiência prévia com sistemas de gestão, atendendo desde produção própria
(hortifruti) até revenda (pequeno comerciante).

**Proposta de valor:** *"Saiba, em segundos, se você ganhou ou perdeu dinheiro
hoje — sem internet, sem planilha, sem complicação."*

**Diferenciais:** offline-first, categorias já pensadas para o agro, cálculo
automático de lucro por venda, linguagem simples, sem exigir conta/cartão.

**Possíveis planos de assinatura** (sugestão para quando houver sincronização em nuvem):
- **Gratuito** — uso local no dispositivo, sem limite de lançamentos (o que já
  existe hoje).
- **Essencial (pago, baixo custo)** — backup automático em nuvem + acesso pelo
  celular e computador ao mesmo tempo.
- **Cooperativa/Comércio** — multiusuário, permissões, relatórios consolidados
  de vários produtores/pontos de venda.

---

## Etapa 7 — Melhorias implementadas nesta fase

Todas de baixo risco, sem alterar arquitetura, dados ou funcionalidades:

1. **Atalho "Vender" e "Comprar" no Painel** (`Dashboard.page.tsx` +
   `Estoque.page.tsx`): dois botões grandes logo abaixo do card de caixa,
   levando direto para o formulário certo (`/estoque?acao=vender`), sem passar
   pela tela de Estoque manualmente. Justificativa: a jornada do feirante
   (Etapa 2) mostrou que essa é a ação mais frequente do dia e a que mais sofre
   com cliques extras.
2. **Rótulo de texto no botão "Ajustar estoque"** (`ProdutoCard.tsx`): antes
   eram só dois ícones de seta sobrepostos, sem nenhuma palavra — ambíguo para
   quem não é do meio técnico. Agora mostra "Ajustar" ao lado do ícone.
3. **Linguagem simplificada nos avisos de Compra e Venda**
   (`CompraModal.tsx`, `VendaModal.tsx`): "atualiza o custo médio do produto" →
   "atualiza sozinho o preço de custo do produto"; "gera automaticamente uma
   entrada financeira e dá baixa no estoque" → "já lança a entrada no seu
   financeiro e desconta sozinho do estoque". Justificativa: linguagem contábil
   ("custo médio ponderado", "baixa", "lançamento") não faz parte do vocabulário
   do público-alvo definido nesta fase.

Nenhuma tela, rota, campo ou regra de negócio foi removida ou teve seu
comportamento alterado — apenas textos e um atalho de navegação adicional.

---

## Etapa 8 — Roadmap do produto

**Versão 1.0 (atual)** — Fundação sólida: financeiro, estoque, compras/vendas
com integração automática, histórico, relatórios, backup, modo escuro, PWA
offline. Objetivo: provar que o produtor consegue substituir o caderno.

**Versão 1.5** — Fecha a lacuna mais sentida hoje: **contas a pagar e a
receber (fiado)**, lembretes de pagamento, exportação simples de relatório em
imagem/PDF para WhatsApp, cadastro rápido de produtos em lote. Objetivo:
cobrir 100% do fluxo financeiro informal que hoje ainda depende de caderno ou
memória.

**Versão 2.0** — Sincronização em nuvem (backup automático, uso em mais de um
aparelho), múltiplos usuários com permissões (dono + ajudante de feira),
cadastro de clientes e fornecedores recorrentes com histórico de compra.
Objetivo: suportar o crescimento do negócio além de uma pessoa.

**Versão 3.0** — Recursos avançados: integração com balança via Bluetooth,
relatórios consolidados para cooperativas/associações de produtores, painel
comparativo entre produtores (uso institucional/sindicato), assinatura paga
para os recursos de nuvem. Objetivo: virar a ferramenta de gestão padrão para
cooperativas e associações rurais, não só para o produtor individual.

---

## Etapa 9 — Validação com 5 produtores amanhã (análise crítica)

Pontos que **poderiam gerar dúvida ou travar o uso** logo no primeiro dia:

- **Cadastro inicial vazio**: um produtor que nunca usou vai abrir o Estoque e
  ver "nenhum produto encontrado" — o texto de apoio já existe ("Cadastre seu
  primeiro produto..."), mas ele pode não saber *quanto* cadastrar de uma vez
  (todos os produtos que vende? só os principais?). Sugestão simples de
  onboarding (não implementada agora): um passo inicial de "cadastre seus 3
  produtos mais vendidos" na primeira abertura.
- **Confusão compra vs. venda vs. ajuste**: são três conceitos parecidos
  (entram/saem produto do estoque) mas com efeitos financeiros diferentes. O
  aviso explicativo em cada modal ajuda, mas só quem lê. Um produtor apressado
  pode registrar uma venda como "ajuste" achando que é a mesma coisa, e isso
  não gera a entrada financeira esperada — ele "perderia" a venda no relatório.
  **Este é o risco de maior impacto para a validação com usuários reais.**
- **Esquecer de exportar backup**: se o produtor trocar de celular sem
  exportar antes, perde tudo. Hoje isso depende do usuário lembrar sozinho.
- **Instalação do PWA**: para os 5 produtores de amanhã, a etapa de "instalar
  como app" (Chrome → menu → instalar) ainda é a barreira mais provável de
  travar o primeiro uso — não por causa do sistema em si, mas por ser um passo
  incomum para quem nunca instalou um PWA antes.

Essas observações não foram corrigidas nesta fase (mudariam fluxo/comportamento),
mas estão priorizadas na próxima seção.

---

## Sugestões para a próxima fase (Correção de Bugs) — não implementadas

1. **Alerta de confirmação mais explícito ao usar "Ajustar estoque"** quando o
   valor parece alto o suficiente para ser uma venda (ex.: perguntar "isso é
   uma venda? Considere usar 'Vender' para registrar o dinheiro recebido.").
   Mitiga o risco #1 da Etapa 9.
2. **Onboarding de primeiro uso**: tela única, opcional, sugerindo cadastrar os
   produtos mais comuns antes de ir para o Painel vazio.
3. **Lembrete programado para exportar backup** (ex.: a cada 15 dias), usando
   o recurso de alarme já disponível no ambiente.
4. Itens já registrados na auditoria da Fase 0 (não repetidos aqui): custo
   médio não recalculado ao excluir compra; leituras diretas ao banco nas
   páginas; falta de testes automatizados; validação de formulário só no
   clique de salvar; ausência de paginação no Histórico.
