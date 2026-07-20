# Design System — GTChat Blog

## 1. Princípios visuais

O design do GTChat Blog combina:

- identidade verde da GTChat;
- superfícies claras e azuladas;
- tipografia editorial de alto contraste;
- cantos arredondados;
- sombras discretas;
- componentes confortáveis para toque;
- adaptação controlada para celular, sem rolagem horizontal.

As configurações publicáveis ficam em `site_settings`; os padrões ficam em `lib/theme.ts`; as variáveis são aplicadas pelo `app/layout.tsx`.

## 2. Cores

### Tokens principais

| Token | Padrão | Uso |
|---|---|---|
| `--primary` | `#106e00` | Identidade, links de destaque, CTA |
| `--accent` | `#006781` | Links secundários, foco, bordas de botão |
| `--bg` | `#f8f9ff` | Fundo público |
| `--text` | `#0b1c30` | Texto principal |
| `--card` | `#ffffff` | Cards e painéis |
| `--muted` | `#52604f` | Texto secundário |
| `--line` | `#dce5d6` | Divisores e bordas |
| `--soft` | `#eff4ff` | Fundos suaves e estados selecionados |

### Cores auxiliares

| Cor | Valor | Uso |
|---|---|---|
| Verde de ação | `#2bad1b` | `.btn-primary` |
| Verde claro | `#e4f5df` | Status publicado |
| Vermelho | `#a61b1b` | Erro e perigo |
| Vermelho claro | `#fff1f0` | Fundo de erro |
| Amarelo claro | `#fff1c7` | Em revisão |
| Azul claro | `#dcecff` | Chips e avatares |
| Fundo do painel | `#f6f8ff` | Área autenticada |
| Fundo da sidebar | `#eef3ff` | Navegação administrativa |

### Exemplo visual

| Principal | Apoio | Fundo | Texto |
|---|---|---|---|
| 🟩 `#106e00` | 🟦 `#006781` | ⬜ `#f8f9ff` | ⬛ `#0b1c30` |

### Regras

- Cores configuráveis devem continuar legíveis.
- Não comunicar status somente por cor; incluir texto.
- Não fixar uma nova cor de marca se um token existente resolver.
- Cores de categoria podem vir do banco, mas texto sobre elas precisa manter contraste.

## 3. Tipografia

### Famílias

| Função | Fonte padrão | Pesos |
|---|---|---|
| Títulos e marca | Hanken Grotesk | 500, 600, 700, 800 |
| Corpo e controles | Inter | 400, 500, 600, 700 |

Fallbacks configuráveis: Arial e Georgia.

```css
body {
  font-family: var(--body-font, "Inter"), sans-serif;
  line-height: 1.55;
}

h1, h2, h3, h4 {
  font-family: var(--heading-font, "Hanken Grotesk"), sans-serif;
  line-height: 1.12;
}
```

### Escala atual

| Elemento | Tamanho |
|---|---|
| Hero `h1` | `clamp(34px, 4vw, 52px)` |
| Artigo `h1` | `clamp(38px, 6vw, 62px)` |
| Cabeçalho de arquivo | `44px` |
| Título administrativo | `34px` |
| Título de seção | `30px` |
| Card `h3` | `22px` |
| Corpo | herdado, normalmente `16px` |
| Prosa de artigo | `18px`, line-height `1.85` |
| Labels | `13px`, peso `700` |
| Chips/status | `12px` |

No celular, títulos maiores são reduzidos para 26–38 px conforme o contexto.

## 4. Espaçamentos

O projeto não possui escala formal em variáveis; use a seguinte escala derivada do CSS atual:

| Nome | Valor | Aplicação |
|---|---:|---|
| `xs` | 5–8 px | Ícone + texto, ferramentas |
| `sm` | 10–14 px | Campos, chips, células |
| `md` | 18–24 px | Cards, painéis, grids |
| `lg` | 28–38 px | Conteúdo de página |
| `xl` | 42–58 px | Seções e hero |

Regras:

- Preferir múltiplos próximos de 4 px.
- Painéis usam normalmente `24px`.
- Conteúdo administrativo usa `30px` no desktop e `14px` no celular.
- Container público tem largura máxima de `1220px`.

## 5. Border radius

| Elemento | Radius |
|---|---:|
| Ferramenta pequena | `7–9px` |
| Botão/input | `10px` |
| Drawer button | `12px` |
| Editor/painel menor | `15–16px` |
| Card público | `18px` |
| Hero/auth card | `22px` |
| CTA | `24px` |
| Chip/status | `999px` |

Use radius maior em superfícies grandes e menor em controles compactos.

## 6. Sombras

### Token global

```css
--shadow: 0 12px 35px rgba(33, 49, 69, 0.08);
```

### Variações

| Uso | Sombra |
|---|---|
| Painel | `0 4px 15px rgba(33,49,69,.035)` |
| Card | `0 6px 20px rgba(33,49,69,.04)` |
| Drawer | `±18px 0 50px rgba(0,0,0,.2)` |
| Barra fixa | `0 -8px 30px rgba(9,30,50,.12)` |
| Foco | `0 0 0 3px #83dafd55` |

Sombras devem reforçar hierarquia, não decorar todas as superfícies.

## 7. Grid e layout

### Container público

```css
.container {
  width: min(1220px, calc(100% - 40px));
  margin: auto;
}
```

### Grids principais

| Classe/área | Desktop | Tablet | Celular |
|---|---|---|---|
| `.post-grid` | 3 colunas | 2 colunas até 980 px | 1 coluna até 720 px |
| `.category-strip` | 4 colunas | 2 colunas | 1 coluna |
| `.stat-grid` | 4 colunas | 2 colunas | 1 coluna |
| `.settings-grid` | `1.4fr .8fr` | 1 coluna | 1 coluna |
| `.editor-layout` | conteúdo + 340 px | 1 coluna | 1 coluna |
| `.theme-workspace` | 440 px + prévia | 1 coluna até 1100 px | 1 coluna |

Sempre usar `minmax(0, 1fr)` em colunas que recebem texto ou inputs.

```css
.safe-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.safe-grid > * {
  min-width: 0;
}
```

## 8. Breakpoints

| Breakpoint | Uso |
|---:|---|
| `1100px` | Editor de aparência passa para uma coluna |
| `980px` | Grids públicos e estruturas administrativas intermediárias |
| `720px` | Navegação móvel, cards de tabela e editor móvel |
| `420px` | Ações em coluna e ajustes para celulares estreitos |

Larguras obrigatórias de verificação: **360, 390, 720/768, 1024 e 1440 px**.

## 9. Botões

### Base

```html
<button class="btn">Ação</button>
```

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 10px;
  font-weight: 700;
}
```

### Variantes

| Classe | Uso |
|---|---|
| `.btn-primary` | Ação principal e publicação |
| `.btn-outline` | Ação secundária |
| `.btn-ghost` | Ação terciária ou discreta |
| `.btn-danger` | Ação destrutiva ou de alto risco |

### Estados

- **Hover:** deslocamento vertical de `-1px`.
- **Focus:** deve ser visível; inputs já usam anel azul.
- **Active:** manter contraste e feedback imediato.
- **Disabled:** reduzir destaque, impedir clique e manter rótulo legível.
- **Busy:** desabilitar e trocar o texto, por exemplo `Publicando...`.

Nunca posicionar duas ações principais concorrentes no mesmo grupo.

## 10. Inputs

Classes: `.input`, `.textarea`, `.select`.

```tsx
<div className="field">
  <label htmlFor="title">Título</label>
  <input id="title" className="input" name="title" required />
</div>
```

Padrão:

- largura `100%`;
- borda `#b9c8b1`;
- radius `10px`;
- padding `12px 14px`;
- foco com `--accent` e anel azul.

Regras:

- Todo input tem label.
- Placeholder não substitui label.
- Inputs em grid precisam de `min-width: 0`.
- Mensagem de erro deve aparecer próxima ao contexto.

## 11. Cards e painéis

### Card público

```html
<article class="post-card">
  <div class="post-card-image">...</div>
  <div class="post-card-body">...</div>
</article>
```

- radius `18px`;
- borda clara;
- sombra sutil;
- hover com elevação de 4 px;
- imagem com `object-fit: cover`.

### Card relacionado lateral

- imagem compacta de `88 × 72 px`;
- título limitado visualmente a três linhas;
- data curta acima do título;
- separador entre itens, sem excesso de sombras;
- bloco lateral com largura máxima de `320px` e posição fixa abaixo do cabeçalho;
- pesquisa em campo compacto com ícone, label acessível e botão de envio visível;
- categorias em painel separado abaixo dos relacionados, com indicador de cor, contador e destaque da categoria atual;
- a coluna nunca cria uma barra de rolagem própria: durante a leitura, o conteúdo lateral desliza do topo até as categorias conforme o progresso da página;
- abaixo de `980px`, o bloco passa para baixo do artigo e ocupa a largura disponível.

### Newsletter

- bloco em gradiente baseado em `--primary` e `--accent`;
- duas colunas no desktop e uma abaixo de `980px`;
- campos brancos com labels visíveis e checkbox de consentimento separado;
- mensagem de sucesso ou erro com `aria-live`;
- botão ocupa toda a largura no celular;
- o elemento do construtor reutiliza exatamente o formulário público, sem simulação visual divergente.

### Painel administrativo

```html
<section class="panel">
  <h2>Título</h2>
  <p>Conteúdo</p>
</section>
```

- fundo branco;
- radius `16px`;
- padding `24px`;
- borda e sombra discretas.

## 12. Modais e drawers

O projeto usa drawers para navegação móvel.

Estrutura visual:

```text
┌──────────────────────────────────────┐
│ backdrop escurecido │ drawer 350 px │
│                     │ título     ×  │
│                     │ navegação     │
│                     │ usuário/sair  │
└──────────────────────────────────────┘
```

Regras obrigatórias:

- `role="dialog"` e `aria-modal="true"`;
- botão de abertura com `aria-expanded` e `aria-controls`;
- foco no primeiro link;
- Tab contido no drawer;
- Escape, backdrop, botão e link fecham;
- rolagem do body bloqueada;
- foco retorna ao gatilho;
- respeitar redução de movimento.

## 13. Tabelas

### Desktop

```tsx
<div className="table-wrap">
  <table className="data-table responsive-table">...</table>
</div>
```

- cabeçalhos em caixa alta, 12 px;
- células com padding de 13 px;
- divisores horizontais;
- wrapper com overflow apenas como proteção.

### Celular

Cada linha vira card e cada célula mostra o rótulo de `data-label`.

```tsx
<td data-label="Status">
  <span className="status status-publicado">publicado</span>
</td>
```

Nunca ocultar o significado da coluna no celular.

## 14. Estados e feedback

| Estado | Padrão |
|---|---|
| Sucesso | `.form-success`, verde e texto explícito |
| Erro | `.form-error`, vermelho e orientação objetiva |
| Vazio | `.empty`, título e próximo passo |
| Publicado | `.status-publicado` |
| Em revisão | `.status-em_revisao` |
| Pendente | ponto amarelo + texto |
| Salvo | ponto verde + texto |

Exemplo:

```tsx
<p className="form-error" role="alert">
  Não foi possível salvar. Revise os campos destacados.
</p>
```

## 15. Ícones

- Biblioteca padrão: **Lucide React**.
- Tamanho comum: 17–24 px.
- Ícone acompanha texto quando o significado não é universal.
- Botão somente com ícone exige `aria-label`.
- Não misturar bibliotecas de ícones.
- Não criar SVG manual quando Lucide já oferece o símbolo.

```tsx
<button type="button" aria-label="Fechar menu" className="drawer-close">
  <X size={24} />
</button>
```

## 16. Responsividade

- Não permitir rolagem horizontal da página.
- Logos extensas usam `max-width`, `max-height` e `object-fit: contain`.
- Grids usam `minmax(0, 1fr)` e filhos usam `min-width: 0`.
- Menus desktop são substituídos por drawers até 720 px.
- Tabelas viram cards.
- Barra do editor pode rolar horizontalmente apenas internamente.
- Ações principais do editor permanecem acessíveis em barra sticky.
- No editor de aparência, controles vêm antes da prévia no celular.
- Abas do tema usam quatro colunas no desktop e duas no celular.
- Botões e textos podem quebrar linha, mas nunca ficar cortados.

## 17. Como criar componentes consistentes

1. Identifique o componente existente mais próximo.
2. Reutilize tokens CSS e classes base.
3. Escolha um radius compatível com o tamanho do elemento.
4. Use a escala de espaçamento documentada.
5. Defina estados hover, focus, active, disabled e busy.
6. Verifique contraste, teclado e toque.
7. Teste em 360 e 1440 px, além do breakpoint relevante.
8. Não adicione cor, fonte, sombra ou biblioteca nova sem necessidade.

### Exemplo de novo card administrativo

```tsx
export function DiagnosticCard({ title, value }: { title: string; value: string }) {
  return <section className="panel diagnostic-card">
    <h2>{title}</h2>
    <strong>{value}</strong>
  </section>;
}
```

```css
.diagnostic-card {
  display: grid;
  min-width: 0;
  gap: 12px;
}

.diagnostic-card strong {
  color: var(--primary);
  font: 800 30px var(--heading-font, "Hanken Grotesk"), sans-serif;
  overflow-wrap: anywhere;
}
```

## Construtor visual

No desktop, o editor usa biblioteca de `280px`, canvas flexível e inspetor de `310px`. Em telas menores, os painéis são empilhados e todas as ações permanecem acessíveis.

Seleção de seção usa contorno azul; seleção de elemento usa verde. Novos elementos devem entrar no contrato `BuilderElementType`, receber defaults, campos de propriedades, renderização pública, responsividade, validação e testes. Todos devem reutilizar os tokens globais de cor, tipografia, raio e sombra.

Durante o arraste, widgets usam cursor `grab`/`grabbing` e o destino recebe contorno tracejado na cor principal. O alvo deve permanecer visível em colunas vazias, com altura mínima de `64px`. Editores de itens compostos usam um cartão discreto por item, campos separados e ação de exclusão com rótulo acessível.

Seções possuem uma barra contextual branca com ícones de edição, reordenação, duplicação e exclusão. Ela aparece no hover ou quando a seção está selecionada. O botão “Adicionar seção aqui” fica na divisão entre blocos para deixar clara a posição de inserção.

As combinações rápidas de seção são: branco, neutro, verde suave, verde GTChat e azul noturno. Cada combinação define fundo e contraste do texto em uma única alteração. Cores personalizadas continuam disponíveis pelos seletores de fundo e texto.
