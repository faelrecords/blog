# Catálogo de componentes

## 1. Convenções do catálogo

- Arquivos em `components/` usam `kebab-case.tsx`.
- Componentes exportados usam PascalCase.
- Server Components não recebem `"use client"`.
- Client Components usam `"use client"` apenas quando precisam de estado, eventos ou APIs do navegador.
- Props são tipadas no próprio arquivo quando exclusivas; tipos compartilhados devem ir para o módulo de domínio correspondente.

## 2. Visão geral

| Componente | Arquivo | Tipo | Responsabilidade |
|---|---|---|---|
| `SiteHeader` | `site-header.tsx` | Server | Cabeçalho público e sessão atual |
| `SiteFooter` | `site-footer.tsx` | Server | Rodapé público configurável |
| `MobileMenu` | `mobile-menu.tsx` | Client | Drawer móvel do blog |
| `PostCard` | `post-card.tsx` | Server | Card de artigo público |
| `RelatedPostsSidebar` | `related-posts-sidebar.tsx` | Server | Menu lateral com artigos relacionados |
| `NewsletterSignup` | `newsletter-signup.tsx` | Client | Cadastro público na lista de e-mails |
| `SubscriberManager` | `subscriber-manager.tsx` | Client | Gestão e exportação de inscritos |
| `AdminShell` | `admin-shell.tsx` | Server | Estrutura das áreas autenticadas |
| `AdminMobileMenu` | `admin-mobile-menu.tsx` | Client | Drawer móvel administrativo |
| `PostEditor` | `editor.tsx` | Client | Criação e edição de artigos |
| `ReviewActions` | `review-actions.tsx` | Client | Aprovação e solicitação de ajustes |
| `ThemeEditor` | `theme-editor.tsx` | Client | Editor visual de aparência |
| `SettingsForm` | `settings-form.tsx` | Client | Configurações gerais do site |
| `UserManager` | `user-manager.tsx` | Client | Gestão da equipe editorial |

---

## 3. `SiteHeader`

### Objetivo

Exibir marca, navegação pública, acesso à autenticação/painel e menu móvel. Lê configurações e sessão diretamente no servidor.

### Quando utilizar

Em todas as páginas públicas do blog.

### Quando não utilizar

Dentro de páginas `/admin` e `/publicar`; use `AdminShell`.

### Props

Não possui props.

### Exemplo

```tsx
export default function PublicPage() {
  return <>
    <SiteHeader />
    <main>Conteúdo</main>
    <SiteFooter />
  </>;
}
```

### Componentes relacionados

`MobileMenu`, `SiteFooter`.

### Nomenclatura

Cabeçalhos globais públicos usam o prefixo `Site`.

---

## 4. `SiteFooter`

### Objetivo

Renderizar logo, nome da marca, texto institucional, ano, artigos e LinkedIn usando `site_settings`.

### Quando utilizar

No final de todas as páginas públicas.

### Quando não utilizar

Em layouts administrativos ou dentro da prévia do tema.

### Props

Não possui props.

### Exemplo

```tsx
<SiteFooter />
```

### Componentes relacionados

`SiteHeader`, prévia interna de `ThemeEditor`.

### Nomenclatura

Rodapés globais públicos usam o prefixo `Site`.

---

## 5. `MobileMenu`

### Objetivo

Fornecer navegação lateral do blog em telas pequenas, com backdrop, foco contido, Escape, bloqueio de rolagem e retorno do foco.

### Quando utilizar

Dentro de `SiteHeader`.

### Quando não utilizar

No painel administrativo; use `AdminMobileMenu`. Não use como modal genérico.

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `panelHref` | `string` | Sim | Destino de Entrar/Painel |
| `signedIn` | `boolean` | Sim | Define o rótulo do acesso |

### Exemplo

```tsx
<MobileMenu signedIn={Boolean(user)} panelHref="/admin" />
```

### Componentes relacionados

`SiteHeader`, `AdminMobileMenu`.

### Nomenclatura

Menus específicos de viewport usam o sufixo `MobileMenu`.

---

## 6. `PostCard`

### Objetivo

Apresentar artigo público em listas com capa, categoria, título, resumo, autor e data.

### Quando utilizar

Na home, arquivo de artigos e listas públicas relacionadas.

### Quando não utilizar

Em tabelas administrativas ou no conteúdo completo do artigo.

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `post` | `PublicPost` | Sim | Artigo já filtrado para exposição pública |

### Exemplo

```tsx
<div className="post-grid">
  {posts.map((post) => <PostCard key={post.id} post={post} />)}
</div>
```

### Componentes relacionados

`SiteHeader`, `SiteFooter`.

### Nomenclatura

Cards de entidade usam `<Entidade>Card`.

### `RelatedPostsSidebar`

Exibe, à direita do artigo, até três publicações recentes, sempre excluindo o artigo atual. Publicações da mesma categoria aparecem primeiro; se não forem suficientes, a lista é completada com as mais recentes do blog. Em telas menores, o bloco deixa de ser fixo e aparece abaixo do conteúdo principal.

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `posts` | `PublicPost[]` | Sim | Artigos públicos já filtrados e ordenados |
| `categoryName` | `string \| null` | Sim | Categoria usada no título contextual |

```tsx
<RelatedPostsSidebar posts={relatedPosts} categoryName={post.category_name} />
```

Não use este componente em grades da home ou do arquivo; nesses casos use `PostCard`.

---

## 7. `AdminShell`

### Objetivo

Compor sidebar, topbar, navegação por função, usuário atual, logout e conteúdo das áreas autenticadas.

### Quando utilizar

Em todas as páginas de `/admin` e `/publicar`.

### Quando não utilizar

No blog público ou na tela `/entrar`.

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `user` | `SessionUser` | Sim | Usuário autenticado validado no servidor |
| `title` | `string` | Sim | Título da topbar |
| `children` | `React.ReactNode` | Sim | Conteúdo da página |

### Exemplo

```tsx
const user = await requireUser("admin");

return <AdminShell user={user} title="Relatórios">
  <div className="app-content">...</div>
</AdminShell>;
```

### Componentes relacionados

`AdminMobileMenu`.

### Nomenclatura

Estruturas globais de uma área usam o sufixo `Shell`.

---

## 8. `AdminMobileMenu`

### Objetivo

Disponibilizar a navegação administrativa em drawer no celular, preservando nome, usuário e logout.

### Quando utilizar

Somente dentro de `AdminShell`.

### Quando não utilizar

No blog público ou como menu desktop.

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `admin` | `boolean` | Sim | Exibe ou oculta rotas administrativas |
| `name` | `string` | Sim | Nome visível do usuário |
| `username` | `string` | Sim | Identificador de login |

### Exemplo

```tsx
<AdminMobileMenu
  admin={user.role === "admin"}
  name={user.name}
  username={user.username}
/>
```

### Componentes relacionados

`AdminShell`, `MobileMenu`.

### Nomenclatura

Componentes exclusivos do painel usam o prefixo `Admin`.

---

## 9. `PostEditor`

### Objetivo

Criar e editar artigos com Tiptap, autosave, título, resumo, slug, categoria, capa, tags, SEO, agendamento e ações editoriais.

### Quando utilizar

Nas páginas `/publicar/novo` e `/publicar/[id]` após validar sessão e propriedade no servidor.

### Quando não utilizar

Para exibir artigo público, editar aparência ou permitir conteúdo sem revisão.

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `initial` | `PostData` | Sim | Estado inicial completo do artigo |
| `categories` | `{ id: number; name: string }[]` | Sim | Categorias disponíveis |
| `canPublish` | `boolean` | Sim | Permite aprovar/publicar/agendar |

`PostData` contém: `id?`, `title`, `slug`, `excerpt`, `content_json`, `content_html`, `cover_image`, `cover_alt`, `category_id`, `tags_text`, `seo_title`, `seo_description`, `status`, `scheduled_at` e `review_note?`.

### Exemplo

```tsx
<PostEditor
  canPublish={user.role === "admin"}
  categories={categories}
  initial={{
    title: "",
    slug: "",
    excerpt: "",
    content_json: "{}",
    content_html: "",
    cover_image: "",
    cover_alt: "",
    category_id: null,
    tags_text: "",
    seo_title: "",
    seo_description: "",
    status: "rascunho",
    scheduled_at: null,
  }}
/>
```

### Componentes relacionados

`AdminShell`, `ReviewActions`.

### Nomenclatura

Editores de entidade usam `<Entidade>Editor`.

---

## 10. `ReviewActions`

### Objetivo

Exibir ações contextuais para aprovar, solicitar ajustes ou abrir um artigo.

### Quando utilizar

Em listagens administrativas de artigos.

### Quando não utilizar

Para redatores ou sem proteção administrativa da página pai.

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `id` | `number` | Sim | ID do artigo |
| `status` | `string` | Sim | Estado editorial atual |

### Exemplo

```tsx
<ReviewActions id={post.id} status={post.status} />
```

### Componentes relacionados

`PostEditor`, `AdminShell`.

### Nomenclatura

Grupos de ações de domínio usam `<Domínio>Actions`.

---

## 11. `ThemeEditor`

### Objetivo

Editar marca, favicon, cores, fontes, blocos da home e chamada final, com prévia controlada em desktop, tablet e celular.

### Quando utilizar

Na página administrativa `/admin/aparencia`.

### Quando não utilizar

Para configuração geral de SEO ou redes sociais; use `SettingsForm`. Não transformar em editor de CSS/JavaScript.

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `initialSettings` | `Record<string, string>` | Sim | Configurações persistidas |
| `initialBlocks` | `InitialBlock[]` | Sim | Blocos persistidos em ordem |

`InitialBlock` contém `id`, `type`, `title`, `enabled`, `position` e `config_json`.

### Exemplo

```tsx
<ThemeEditor
  initialSettings={getSettings()}
  initialBlocks={getHomeBlocks()}
/>
```

### Componentes relacionados

`AssetField` e `ThemePreview`, internos ao mesmo arquivo; `SettingsForm`.

### Nomenclatura

Subcomponentes privados permanecem no arquivo quando não têm uso externo.

---

## 12. `SettingsForm`

### Objetivo

Editar título, descrição para buscadores, texto de rodapé e URLs de redes sociais.

### Quando utilizar

Na página `/admin/configuracoes`.

### Quando não utilizar

Para cores, fontes, logo ou blocos da home; use `ThemeEditor`.

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `settings` | `Record<string, string>` | Sim | Valores iniciais de `site_settings` |

### Exemplo

```tsx
<SettingsForm settings={getSettings()} />
```

### Componentes relacionados

`ThemeEditor`.

### Nomenclatura

Formulários de uma área usam `<Área>Form`.

---

## 13. `UserManager`

### Objetivo

Listar usuários, criar contas, ativar/desativar e redefinir senha.

### Quando utilizar

Na página administrativa `/admin/usuarios`.

### Quando não utilizar

Em páginas acessíveis a redatores ou visitantes.

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `users` | `User[]` | Sim | Usuários sem hashes ou segredos |

`User` contém `id`, `name`, `username`, `role`, `active` e `created_at`.

### Exemplo

```tsx
const users = db.prepare(
  "SELECT id,name,username,role,active,created_at FROM users ORDER BY name"
).all();

<UserManager users={users} />
```

### Componentes relacionados

`AdminShell`.

### Nomenclatura

Interfaces que concentram listagem e mutações usam `<Entidade>Manager`.

---

## 14. Componentes internos de `ThemeEditor`

### `AssetField`

- **Objetivo:** pré-visualizar, substituir e remover logo/favicon.
- **Uso:** somente dentro de `ThemeEditor`.
- **Props:** `label`, `value`, `alt`, `accept`, `compact?`, `onUpload`, `onRemove`.
- **Não utilizar:** diretamente em outras páginas enquanto o contrato depender do endpoint de tema.

### `ThemePreview`

- **Objetivo:** simular a home com tokens e blocos ainda não publicados.
- **Uso:** somente dentro de `ThemeEditor`.
- **Props:** `settings`, `blocks`, `device`.
- **Não utilizar:** como página pública, iframe ou fonte de dados persistidos.

## 15. Como adicionar um componente

1. Confirmar que a extração melhora reutilização ou legibilidade.
2. Criar `components/nome-do-componente.tsx`.
3. Manter Server Component, se possível.
4. Definir props explícitas.
5. Reutilizar classes e tokens existentes.
6. Documentar acessibilidade e estados.
7. Adicionar o componente a este catálogo.

---

## 16. `CategoryManager`

### Objetivo

Criar, listar e excluir categorias sem sair das configurações ou do editor de artigos.

### Quando utilizar

Em interfaces exclusivas para administradores que precisam gerenciar a taxonomia editorial.

### Quando não utilizar

No blog público ou na área do redator. O endpoint também exige função `admin`.

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---:|---|
| `categories` | `CategoryItem[]` | Sim | Categorias iniciais com ID, nome, slug, cor e contagem |
| `compact` | `boolean` | Não | Adapta o componente ao painel recolhível do editor |

### Exemplo

```tsx
<CategoryManager categories={categories} compact />
```

### Componentes relacionados

`PostEditor`, `SettingsForm` e `AdminShell`.

### Nomenclatura

Gerenciadores completos de entidades usam o sufixo `Manager`.

## 17. Componentes internos do construtor de tema

- `BlockInspector`: edita somente os campos permitidos para a seção selecionada.
- `SectionHeading`: mantém título e descrição com espaçamento consistente.
- `ThemePreview`: representa seções ainda não publicadas em desktop, tablet e celular.
- `AssetField`: envia, substitui ou remove logo e favicon.

Esses componentes são internos de `ThemeEditor` e não devem ser importados por outras páginas.

O `ThemeEditor` usa uma área de trabalho em três colunas no desktop: biblioteca e estrutura à esquerda, página ao centro e configurações à direita. Em telas menores, as três áreas são empilhadas sem remover nenhuma função.

## 18. Navegação administrativa

### `AdminSidebar`

Exibe a navegação do painel e permite recolher a barra lateral. A preferência é mantida no navegador. Recebe `admin: boolean` para apresentar somente as rotas permitidas à função atual.

### `AdminProfileMenu`

Substitui o antigo bloco de usuário no rodapé da barra lateral. Recebe `user: SessionUser` e abre um menu no topo com identificação, gerenciamento de usuários, configurações e logout. Para redatores, apresenta apenas os atalhos compatíveis com sua permissão.

## 19. `PageBuilderEditor`

Editor em três painéis usado exclusivamente em `/admin/paginas/[id]/editor`. Recebe metadados da página, `BuilderDocument`, artigos, categorias e modelos reutilizáveis. Oferece layouts de uma a quatro colunas, 16 elementos, 10 modelos, undo/redo, autosave, upload, responsividade, SEO, publicação e versões.

Os elementos da biblioteca podem ser clicados ou arrastados. Ao arrastar, podem ser inseridos antes ou depois de outro elemento e também movidos entre colunas. O clique continua disponível como alternativa acessível e adiciona o elemento à coluna selecionada.

Cada seção exibe uma barra contextual no canvas para editar, mover, duplicar e excluir, além de um botão para inserir uma nova seção exatamente abaixo. A barra de ações do inspetor permite mover, duplicar ou excluir o elemento selecionado sem abrir o painel de camadas.

O inspetor de seção oferece combinações de cores prontas, cores personalizadas, largura, altura mínima, distância entre colunas, alinhamento vertical, espaçamento, raio e sombra. O alinhamento horizontal de elementos compostos deve posicionar em conjunto título, descrição e botão.

Elementos com listas compostas usam o formato persistido `título|descrição`, mas o inspetor apresenta campos separados. Em `Benefícios`, cada item possui título e descrição editáveis; em `FAQ`, cada item possui pergunta e resposta.

## 20. `PageRenderer`

Renderiza o mesmo `BuilderDocument` na prévia e no site público, sem HTML arbitrário.

```tsx
<PageRenderer document={document} posts={posts} categories={categories} />

// Somente dentro do editor
<PageRenderer document={document} editable dropTargetId={dropTargetId} />
```

## 21. `AdminPagesManager`

Lista, cria, duplica e exclui páginas. A página inicial é protegida contra exclusão.

## 22. `GlobalAppearanceEditor`

Edita somente marca, logo, favicon, cores e tipografia globais. A estrutura da home não é duplicada nessa tela: o atalho leva diretamente ao novo `PageBuilderEditor`.

## 23. `NewsletterSignup`

Formulário público reutilizado no final dos artigos e pelo elemento `newsletter` do construtor. Recebe `content` com título, descrição, texto do botão e consentimento, além de `compact` opcional. O componente envia nome opcional, e-mail, consentimento, origem e honeypot para `/api/newsletter/subscribe`.

```tsx
<NewsletterSignup content={{ title: "Conteúdos exclusivos" }} />
```

Não acessar o SQLite no cliente nem informar se o e-mail já existia.

## 24. `SubscriberManager`

Interface exclusiva de `/admin/inscritos`. Recebe listagem, indicadores e configurações iniciais; pesquisa, pagina, edita, ativa, desativa, exclui e direciona a exportação CSV. Toda mutação continua validada nos endpoints administrativos.
