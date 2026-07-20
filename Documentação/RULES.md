# Regras obrigatórias de desenvolvimento

## 1. Princípios gerais

1. Segurança e integridade dos dados têm prioridade sobre conveniência.
2. Regras de autorização são verificadas no servidor.
3. A interface deve funcionar em desktop e celular.
4. A solução mais simples compatível com a arquitetura deve ser preferida.
5. Código, testes, migrations e documentação devem evoluir juntos.

## 2. Convenções de código

### TypeScript

- Modo estrito obrigatório.
- Não usar `any` sem justificativa documentada.
- Usar `type` para props e modelos locais simples.
- Usar `unknown` para dados ainda não validados.
- Imports internos devem usar `@/`, exceto scripts executados fora do bundler quando um caminho relativo for mais seguro.
- Evitar funções extensas e múltiplas responsabilidades.

### Formatação

- UTF-8.
- Aspas duplas em TypeScript/TSX.
- Ponto e vírgula.
- JSX legível; componentes complexos devem ser divididos em blocos ou componentes menores.
- Não reformatar arquivos não relacionados à tarefa.

### Banco e domínio

- Tabelas e colunas: `snake_case`.
- Estados persistidos: português em `snake_case`.
- Consultas sempre parametrizadas.
- Datas persistidas em ISO 8601.
- Booleanos do SQLite usam `0` e `1`.

## 3. Nomeação de arquivos

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componente React | `kebab-case.tsx` | `theme-editor.tsx` |
| Biblioteca | `kebab-case.ts` ou nome curto | `security.ts` |
| Teste | `<arquivo>.test.ts` | `security.test.ts` |
| Página Next.js | `page.tsx` | `app/admin/page.tsx` |
| Endpoint Next.js | `route.ts` | `app/api/posts/route.ts` |
| Migration | número + descrição | `0001_add_post_history.sql` |
| Documento principal | `UPPERCASE.md` | `API.md` |

Não criar variações como `ComponentNew.tsx`, `final.tsx`, `teste2.tsx` ou `backup.tsx`.

## 4. Nomeação de componentes

- PascalCase: `PostCard`, `ThemeEditor`, `AdminShell`.
- Props terminam em `Props` quando o tipo for reutilizado.
- Handlers começam com `handle` quando declarados como callback de interface.
- Funções de ação podem usar verbos diretos: `save`, `upload`, `toggle`, `approve`.
- Booleanos começam com `is`, `has`, `can` ou descrevem um estado inequívoco: `saving`, `signedIn`.

```tsx
type ArticleStatusProps = {
  status: string;
  canReview: boolean;
};
```

## 5. Estrutura de commits

- Um assunto por commit.
- Mensagem curta e descritiva, sem ponto final.
- Preferir português para manter o histórico consistente.
- Corpo opcional explica motivação, risco e migração.

```text
Adiciona histórico de revisão aos artigos

- registra autor da mudança
- mantém compatibilidade com artigos existentes
```

Proibido:

```text
ajustes
fix
coisas novas
WIP final 2
```

## 6. Organização de pastas

- Páginas e endpoints ficam em `app/`.
- Componentes compartilhados ficam em `components/`.
- Regras reutilizáveis, segurança e acesso a dados ficam em `lib/`.
- Schema declarativo fica em `db/schema.ts`.
- Migrations ficam em `drizzle/`.
- Operações administrativas locais ficam em `scripts/`.
- Documentação fica em `Documentação/`.
- Dados persistentes ficam em `data/` e nunca no Git.

Não criar uma segunda camada de arquitetura (`src/`, `services/`, `utils/`) sem necessidade real e migração planejada.

## 7. Regras de performance

- Usar Server Components por padrão.
- Não adicionar `"use client"` a páginas inteiras sem necessidade.
- Buscar apenas colunas necessárias em listagens de alto volume.
- Manter índices para filtros frequentes de status, data, autor e slug.
- Evitar consultas dentro de loops.
- Limitar listas públicas e endpoints; paginação deve ser adicionada antes de crescimento relevante.
- Imagens precisam de dimensões previsíveis, `object-fit` e tamanho de upload limitado.
- Não carregar bibliotecas pesadas no blog público sem justificativa.
- Evitar efeitos que causem requisições duplicadas.
- Preservar o modo WAL do SQLite para a instância única.
- Manter conteúdo e autenticação em `blog.sqlite` e inscritos em `newsletter.sqlite`.
- Incluir os dois bancos e uploads no procedimento de backup.

## 8. Regras de acessibilidade

- HTML semântico antes de ARIA.
- Todo campo deve ter `label` associado.
- Todo botão de ícone deve ter `aria-label`.
- Menus modais usam `role="dialog"`, `aria-modal="true"`, foco inicial, contenção de Tab, Escape e restauração do foco.
- A página não pode rolar atrás de um drawer aberto.
- Foco visível obrigatório.
- Área interativa recomendada: pelo menos 42–44 px.
- Contraste de texto deve atender WCAG AA.
- Imagens informativas exigem `alt`; imagens decorativas usam `alt=""`.
- Não comunicar estado apenas por cor.
- Respeitar `prefers-reduced-motion`.
- Tabelas convertidas em cartões no celular devem manter rótulos com `data-label`.

## 9. Regras de SEO

- Toda página pública deve ter título e descrição coerentes.
- Artigos usam `seo_title` e `seo_description`, com fallback para título e resumo.
- Slugs devem ser legíveis, únicos e estáveis.
- Somente artigos publicados ou agendados cuja data chegou podem ser indexados.
- Imagem Open Graph deve ter URL válida e texto alternativo adequado.
- Manter `sitemap.xml`, `robots.txt` e `rss.xml` funcionais.
- Não publicar conteúdo duplicado em slugs diferentes.
- Alterações de domínio usam `APP_URL`; não fixar host de produção no código.

## 10. Regras de APIs e segurança

- Validar autenticação com `apiUser()`.
- Validar perfil com `apiUser("admin")` quando necessário.
- Verificar propriedade do artigo para redatores.
- Validar origem em mutações com `sameOrigin()`.
- Validar JSON com Zod.
- Retornar códigos HTTP coerentes.
- Nunca retornar `password_hash`, `token_hash` ou segredos.
- Senhas têm no mínimo 10 caracteres e são protegidas com scrypt.
- Sessões armazenam somente SHA-256 do token.
- HTML de artigo passa por `sanitizePostHtml()`.
- Upload aceita somente tipos permitidos, tamanho limitado e nome gerado pelo servidor.

## 11. Boas práticas

- Reutilizar `DEFAULT_THEME_SETTINGS` e `DEFAULT_HOME_BLOCKS`.
- Registrar ações relevantes em `audit_log`.
- Usar transação em atualizações múltiplas.
- Preservar mensagens em português e objetivas.
- Incluir estados vazios e mensagens de erro.
- Manter o comportamento sem rolagem horizontal em 360, 390, 720, 768, 1024 e 1440 px.
- Documentar limitações reais, como execução em instância única com SQLite.

## 12. O que nunca deve ser feito

- Nunca versionar banco, uploads, `.env` ou credenciais.
- Nunca usar credenciais de demonstração em produção.
- Nunca expor uma rota administrativa sem proteção no servidor.
- Nunca confiar em `role` ou `author_id` enviados pelo cliente.
- Nunca publicar HTML não sanitizado.
- Nunca aceitar extensões de upload apenas pelo nome do arquivo.
- Nunca permitir caminhos fornecidos pelo usuário em leitura ou escrita.
- Nunca habilitar CSS/JavaScript arbitrário no tema.
- Nunca usar `dangerouslySetInnerHTML` com conteúdo não sanitizado.
- Nunca alterar dados reais para testes sem isolamento e limpeza garantida.
- Nunca quebrar o fluxo obrigatório de revisão do redator.
- Nunca introduzir escala horizontal usando o mesmo arquivo SQLite.
- Nunca finalizar com alterações temporárias ou arquivos gerados no Git.

## 13. Checklist antes de finalizar qualquer tarefa

### Escopo

- [ ] A mudança atende exatamente ao pedido.
- [ ] Arquivos não relacionados foram preservados.
- [ ] Não há funcionalidade especulativa.

### Código e dados

- [ ] TypeScript está tipado sem `any` desnecessário.
- [ ] Entradas são validadas no servidor.
- [ ] Autorização e propriedade do recurso foram verificadas.
- [ ] Queries são parametrizadas.
- [ ] Mudança de schema possui migration.
- [ ] A migration foi criada no diretório do banco correto: `drizzle/` ou `newsletter-drizzle/`.
- [ ] HTML e uploads seguem as regras de segurança.

### Interface

- [ ] Estados de carregamento, erro, vazio e desabilitado foram considerados.
- [ ] Teclado, foco, Escape e leitores de tela foram considerados.
- [ ] Layout foi conferido em desktop e celular.
- [ ] Não existe rolagem horizontal acidental.
- [ ] Textos e botões não ficam cortados.

### SEO e conteúdo

- [ ] Metadados e slugs continuam corretos.
- [ ] Apenas conteúdo publicável aparece no blog.
- [ ] Imagens têm texto alternativo.

### Validação e entrega

- [ ] Testes relevantes foram criados ou atualizados.
- [ ] `npm test` passou.
- [ ] `npm run build` passou.
- [ ] `git diff --check` não encontrou erros.
- [ ] `git status` contém somente arquivos esperados.
- [ ] Documentação afetada foi atualizada.
- [ ] Nenhum segredo ou dado persistente entrou no commit.
