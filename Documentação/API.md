# API e Route Handlers

## 1. Visão geral

A API é interna, servida pelo App Router do Next.js. As respostas usam JSON, exceto login/logout, mídia e RSS.

### Base URL

```text
Local:    http://localhost:3000
Produção: https://blog.vibecodex.pro
```

### Autenticação

A sessão é enviada automaticamente pelo navegador:

```http
Cookie: gtchat_session=<token>
```

O cookie é `HttpOnly`, `SameSite=Lax`, tem duração de sete dias e usa `Secure` sob HTTPS. O banco armazena apenas o SHA-256 do token.

### Headers comuns

Para JSON:

```http
Content-Type: application/json
Cookie: gtchat_session=<token>
Origin: https://blog.vibecodex.pro
```

Para upload:

```http
Content-Type: multipart/form-data; boundary=...
Cookie: gtchat_session=<token>
```

Mutações autenticadas devem ser de mesma origem. O navegador define o boundary de `multipart/form-data`; não o escreva manualmente.

## Categorias administrativas

### `GET /api/admin/categories`

- **Descrição:** lista categorias e a quantidade de artigos vinculados.
- **Autenticação:** administrador.
- **Headers:** cookie de sessão.
- **Body:** não possui.
- **Sucesso `200`:**

```json
{"categories":[{"id":1,"name":"Produto","slug":"produto","color":"#106e00","count":4}]}
```

- **Erros:** `401` quando a sessão não pertence a um administrador.

### `POST /api/admin/categories`

- **Descrição:** cria uma categoria. O slug é gerado no servidor e recebe sufixo quando necessário.
- **Autenticação:** administrador.
- **Headers:** `Content-Type: application/json`, cookie e `Origin` de mesma origem.
- **Body:**

```json
{"name":"Atendimento","color":"#006781"}
```

- **Sucesso `201`:** retorna `id`, `name`, `slug`, `color` e `count: 0`.
- **Erros:** `400` para nome/cor inválidos, `401` sem sessão e `403` para origem inválida.

### `DELETE /api/admin/categories/:id`

- **Descrição:** exclui a categoria e mantém seus artigos, removendo apenas o vínculo de categoria.
- **Autenticação:** administrador.
- **Headers:** cookie e `Origin` de mesma origem.
- **Body:** não possui.
- **Sucesso `200`:**

```json
{"ok":true,"affected_posts":2}
```

- **Erros:** `400` para ID inválido, `401`, `403` ou `404`.

Exemplo:

```bash
curl -X DELETE http://localhost:3000/api/admin/categories/3 \
  -H "Origin: http://localhost:3000" \
  -H "Cookie: gtchat_session=TOKEN"
```

### Erros comuns

| Status | Significado |
|---:|---|
| `400` | Payload ou regra de negócio inválida |
| `401` | Sessão ausente ou inválida |
| `403` | Origem, função ou permissão inválida |
| `404` | Recurso ou ação não encontrada |
| `409` | Conflito de estado ou unicidade |
| `413` | Upload acima do limite |
| `429` | Muitas tentativas de login |

---

## 2. Autenticação

### `POST /api/auth/login`

**Descrição:** autentica administrador ou redator, cria sessão e redireciona para a área adequada.

**Autenticação:** pública.

**Headers:** `Content-Type: application/x-www-form-urlencoded` ou formulário HTML; `Origin` de mesma origem.

**Body:**

| Campo | Tipo | Regra |
|---|---|---|
| `username` | string | normalizado para minúsculas |
| `password` | string | senha da conta |

**Exemplo:**

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "username=redatora&password=SENHA_SEGURA"
```

**Sucesso:** `303 See Other`, `Set-Cookie` e redirecionamento:

- administrador: `/admin`;
- redator: `/publicar`.

**Erros:**

- `303 /entrar?erro=1`: credenciais inválidas;
- `403`: texto `Origem inválida`;
- `429`: texto `Muitas tentativas. Aguarde.` após cinco falhas no período de bloqueio.

### `POST /api/auth/logout`

**Descrição:** invalida a sessão atual, remove o cookie e redireciona à home.

**Autenticação:** cookie opcional; sem sessão também finaliza com sucesso.

**Body:** vazio.

**Exemplo:**

```bash
curl -i -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: gtchat_session=TOKEN"
```

**Sucesso:** `303 See Other` para `/`, cookie removido.

---

## 3. Artigos

### Modelo de payload de artigo

```json
{
  "title": "Como melhorar o atendimento",
  "slug": "como-melhorar-o-atendimento",
  "excerpt": "Resumo com até 500 caracteres.",
  "content_json": "{\"type\":\"doc\",\"content\":[]}",
  "content_html": "<p>Conteúdo do artigo.</p>",
  "cover_image": "/media/arquivo.webp",
  "cover_alt": "Equipe acompanhando conversas",
  "category_id": 1,
  "tags_text": "Atendimento, IA",
  "seo_title": "Como melhorar o atendimento | GTChat",
  "seo_description": "Estratégias práticas para melhorar o atendimento.",
  "scheduled_at": null
}
```

O `scheduled_at` é aceito na atualização. Na criação o status inicial sempre será `rascunho`.

### `GET /api/posts`

**Descrição:** lista artigos visíveis para a sessão. Administradores recebem todos; redatores recebem apenas os próprios.

**Autenticação:** administrador ou redator.

**Headers:** cookie de sessão.

**Body:** nenhum.

**Sucesso — `200`:**

```json
[
  {
    "id": 12,
    "title": "Como melhorar o atendimento",
    "slug": "como-melhorar-o-atendimento",
    "status": "rascunho",
    "category_name": "Sucesso do Cliente",
    "author_name": "Redatora GTChat"
  }
]
```

**Erro:** `401 { "error": "Não autorizado" }`.

### `POST /api/posts`

**Descrição:** cria um rascunho para o usuário autenticado, gera slug único, sanitiza o HTML e registra auditoria.

**Autenticação:** administrador ou redator.

**Headers:** JSON, cookie e mesma origem.

**Body:** modelo de artigo sem necessidade de `scheduled_at`.

**Exemplo:**

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -H "Cookie: gtchat_session=TOKEN" \
  -d '{"title":"Novo artigo","slug":"","excerpt":"Resumo","content_json":"{}","content_html":"<p>Texto</p>","cover_image":"","cover_alt":"","category_id":1,"tags_text":"IA","seo_title":"","seo_description":""}'
```

**Sucesso — `200`:**

```json
{ "id": 13, "slug": "novo-artigo" }
```

**Erros:**

- `400 { "error": "Preencha o título e verifique os campos." }`;
- `401 { "error": "Não autorizado" }`;
- `403 { "error": "Origem inválida" }`.

### `GET /api/posts/:id`

**Descrição:** retorna um artigo. Redatores só acessam artigos próprios.

**Autenticação:** administrador ou proprietário.

**Sucesso — `200`:** objeto completo da tabela `posts`.

**Erros:**

- `401 { "error": "Não autorizado" }`;
- `404 { "error": "Não encontrado" }` para artigo ausente ou sem propriedade.

### `PUT /api/posts/:id`

**Descrição:** atualiza artigo, resolve conflito de slug e sanitiza HTML. Redator só edita `rascunho` ou `alteracoes_solicitadas`.

**Autenticação:** administrador ou proprietário.

**Headers:** JSON, cookie e mesma origem.

**Body:** modelo completo de artigo, incluindo `scheduled_at` quando aplicável.

**Exemplo:**

```js
const response = await fetch(`/api/posts/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(article),
});
```

**Sucesso — `200`:**

```json
{ "id": 13, "slug": "novo-artigo" }
```

**Erros:**

- `400 { "error": "Campos inválidos" }`;
- `401 { "error": "Não autorizado" }`;
- `403 { "error": "Origem inválida" }`;
- `404 { "error": "Não encontrado" }`;
- `409 { "error": "Este artigo está em revisão e não pode ser alterado." }`.

### `DELETE /api/posts/:id`

**Descrição:** arquiva logicamente o artigo; não remove a linha.

**Autenticação:** somente administrador.

**Body:** nenhum.

**Sucesso — `200`:**

```json
{ "ok": true }
```

**Erro:** `401 { "error": "Não autorizado" }`.

> Estado atual: este handler exige autenticação administrativa, mas não chama `sameOrigin`. Novas mutações devem aplicar a proteção de origem.

---

## 4. Fluxo editorial

### `POST /api/posts/:id/submit`

**Descrição:** envia artigo para revisão e define status `em_revisao`.

**Autenticação:** proprietário ou administrador.

**Body:** `{}`.

**Sucesso:** `200 { "ok": true }`.

**Erros:** `401`, `403 Origem inválida`, `403 Sem permissão`, `404 Artigo não encontrado`.

### `POST /api/posts/:id/approve`

**Descrição:** publica imediatamente ou agenda o artigo e registra `post_reviews`.

**Autenticação:** somente administrador.

**Body para publicação imediata:**

```json
{}
```

**Body para agendamento:**

```json
{ "scheduled_at": "2026-08-01T12:00:00-03:00" }
```

**Sucesso:** `200 { "ok": true }`.

**Erros:** `401`, `403 Origem inválida`, `403 Somente administradores podem revisar`, `404 Artigo não encontrado`.

### `POST /api/posts/:id/request-changes`

**Descrição:** devolve o artigo ao redator com nota e status `alteracoes_solicitadas`.

**Autenticação:** somente administrador.

**Body:**

```json
{ "note": "Inclua a fonte dos dados e revise o texto alternativo da capa." }
```

A nota é aparada e limitada a 1.000 caracteres.

**Sucesso:** `200 { "ok": true }`.

**Erros:**

- `400 { "error": "Informe o que precisa ser ajustado." }`;
- `401`, `403` ou `404` conforme regras comuns.

### Ação inválida

Qualquer outro valor em `/api/posts/:id/:action` retorna:

```http
404 Not Found
```

```json
{ "error": "Ação inválida" }
```

---

## 5. Mídia

### `POST /api/media`

**Descrição:** recebe imagem, gera nome seguro, grava em `data/uploads` e registra metadados.

**Autenticação:** administrador ou redator.

**Headers:** `multipart/form-data` e cookie.

**Body:** campo `file`.

**Formatos:** JPEG, PNG, WebP e GIF.

**Limite:** `MAX_UPLOAD_MB`, com padrão de 5 MB.

**Exemplo:**

```bash
curl -X POST http://localhost:3000/api/media \
  -H "Cookie: gtchat_session=TOKEN" \
  -F "file=@capa.webp"
```

**Sucesso — `200`:**

```json
{ "id": 8, "url": "/media/1784549710646-4c8cb38458ed8bdb.webp" }
```

**Erros:**

- `400 { "error": "Envie uma imagem JPG, PNG, WebP ou GIF." }`;
- `401 { "error": "Não autorizado" }`;
- `413 { "error": "A imagem excede o limite permitido." }`.

### `GET /media/:name`

**Descrição:** entrega arquivo já registrado na tabela `media`.

**Autenticação:** pública.

**Sucesso:** bytes da imagem com `Content-Type`, `nosniff` e cache imutável de um ano.

**Erro:** `404` para nome inválido, registro ausente ou arquivo inexistente.

---

## 6. Usuários administrativos

### `GET /api/admin/users`

**Descrição:** lista usuários sem hashes de senha.

**Autenticação:** somente administrador.

**Sucesso — `200`:**

```json
[
  {
    "id": 1,
    "name": "Administrador GTChat",
    "username": "admin",
    "role": "admin",
    "active": 1,
    "created_at": "2026-07-20T12:00:00.000Z"
  }
]
```

**Erro:** `401 { "error": "Não autorizado" }`.

### `POST /api/admin/users`

**Descrição:** cria administrador ou redator ativo.

**Autenticação:** somente administrador.

**Body:**

```json
{
  "name": "Nova Redatora",
  "username": "nova.redatora",
  "password": "senha-com-10-ou-mais",
  "role": "redator"
}
```

**Regras:** nome entre 2 e 100; username `/^[a-z0-9._-]{3,32}$/`; senha mínima de 10; perfil `admin` ou `redator`.

**Sucesso — `200`:**

```json
{ "id": 4 }
```

**Erros:**

- `400`: dados inválidos;
- `401`: não autorizado;
- `403`: origem inválida;
- `409`: username já utilizado.

### `PUT /api/admin/users/:id`

**Descrição:** ativa/desativa usuário ou redefine senha. Redefinir senha encerra todas as sessões do usuário.

**Autenticação:** somente administrador.

**Body para status:**

```json
{ "active": false }
```

**Body para senha:**

```json
{ "password": "nova-senha-segura" }
```

**Sucesso:** `200 { "ok": true }`.

**Erros:**

- `400`: tentativa de desativar a própria conta ou senha curta;
- `401`: não autorizado;
- `403`: origem inválida.

---

## 7. Configurações gerais

### `GET /api/admin/settings`

**Descrição:** retorna todas as chaves atuais de `site_settings`.

**Autenticação:** somente administrador.

**Sucesso — `200`:**

```json
{
  "site_title": "GTChat Blog",
  "site_description": "Estratégias e práticas para atendimento inteligente.",
  "footer_text": "Conteúdo para transformar conversas em resultados.",
  "linkedin_url": "https://linkedin.com",
  "instagram_url": "https://instagram.com"
}
```

### `PUT /api/admin/settings`

**Descrição:** atualiza somente chaves permitidas de identidade, SEO e redes sociais.

**Autenticação:** somente administrador.

**Body:** objeto string/string. Cada valor aceita até 2.000 caracteres.

```json
{
  "site_title": "GTChat Blog",
  "site_description": "Conteúdo sobre atendimento e IA.",
  "footer_text": "GTChat",
  "linkedin_url": "https://www.linkedin.com/company/gtchat",
  "instagram_url": "https://www.instagram.com/gtchat"
}
```

**Sucesso:** `200 { "ok": true }`.

**Erros:** `400 Dados inválidos`, `401 Não autorizado`, `403 Origem inválida`.

---

## 8. Tema e página inicial

### `GET /api/admin/theme`

**Descrição:** retorna configurações e blocos da home.

**Autenticação:** somente administrador.

**Sucesso:**

```json
{
  "settings": {
    "logo_text": "GTChat",
    "primary_color": "#106e00"
  },
  "blocks": [
    {
      "id": "hero",
      "type": "hero",
      "title": "Artigo em destaque",
      "enabled": 1,
      "position": 0,
      "config_json": "{}"
    }
  ]
}
```

### `PUT /api/admin/theme`

**Descrição:** atualiza tokens visuais permitidos e ordem/visibilidade dos blocos, em transação, com auditoria.

**Autenticação:** somente administrador.

**Body:**

```json
{
  "settings": {
    "logo_text": "GTChat",
    "logo_url": "/media/logo.webp",
    "favicon_url": "/media/favicon.png",
    "primary_color": "#106e00",
    "accent_color": "#006781",
    "background_color": "#f8f9ff",
    "text_color": "#0b1c30",
    "heading_font": "Hanken Grotesk",
    "body_font": "Inter",
    "cta_title": "Pronto para transformar seu atendimento?",
    "cta_text": "Conheça a GTChat.",
    "cta_label": "Conhecer a GTChat",
    "cta_url": "https://vibecodex.pro"
  },
  "blocks": [
    { "id": "hero", "enabled": true, "position": 0 },
    { "id": "latest", "enabled": true, "position": 1 },
    { "id": "categories", "enabled": true, "position": 2 },
    { "id": "cta", "enabled": true, "position": 3 }
  ]
}
```

Máximo de dez blocos; posição inteira entre 0 e 20; valores de configuração com até 1.000 caracteres.

**Sucesso:** `200 { "ok": true }`.

**Erros:** `400 Configuração inválida`, `401 Não autorizado`, `403 Origem inválida`.

---

## 9. Feeds e arquivos públicos

### `GET /rss.xml`

**Descrição:** retorna os 30 artigos públicos mais recentes em RSS 2.0.

**Autenticação:** pública.

**Sucesso:** `200`, `Content-Type: application/rss+xml; charset=utf-8`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>GTChat Blog</title>
    <item>
      <title>Como melhorar o atendimento</title>
      <link>https://blog.vibecodex.pro/artigos/como-melhorar-o-atendimento</link>
    </item>
  </channel>
</rss>
```

### `GET /sitemap.xml`

Gerado por `app/sitemap.ts`; inclui rotas públicas e artigos publicáveis.

### `GET /robots.txt`

Gerado por `app/robots.ts`; define regras de rastreamento e referência ao sitemap.

---

## 10. Convenções para novos endpoints

### Estrutura

```text
app/api/<recurso>/route.ts
app/api/<recurso>/[id]/route.ts
```

### Modelo obrigatório

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { sameOrigin } from "@/lib/request";

const schema = z.object({
  name: z.string().min(2).max(100),
});

export async function POST(request: NextRequest) {
  const user = await apiUser("admin");
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  // Query parametrizada e regra de domínio.
  return NextResponse.json({ ok: true }, { status: 201 });
}
```

### Regras

1. Validar sessão e função no servidor.
2. Verificar propriedade do recurso quando aplicável.
3. Aplicar `sameOrigin` em toda mutação autenticada.
4. Validar payload com Zod antes de usar os dados.
5. Usar queries parametrizadas.
6. Usar transação para gravações relacionadas.
7. Não expor hashes, tokens, caminhos locais ou stack traces.
8. Retornar erros em português com formato `{ "error": "..." }`.
9. Usar `200` para leitura/atualização, `201` para criação nova quando possível, `204` apenas sem corpo.
10. Documentar o endpoint neste arquivo e adicionar testes.

## Editor de páginas

Todas as rotas exigem administrador; mutações também exigem mesma origem.

| Endpoint | Método | Finalidade |
|---|---|---|
| `/api/admin/pages` | `GET` | Listar páginas |
| `/api/admin/pages` | `POST` | Criar página em branco ou a partir de modelo |
| `/api/admin/pages/:id` | `GET` | Consultar página e rascunho |
| `/api/admin/pages/:id` | `PUT` | Autosave, salvar, publicar ou arquivar |
| `/api/admin/pages/:id` | `DELETE` | Excluir página que não seja a home |
| `/api/admin/pages/:id/duplicate` | `POST` | Duplicar como rascunho |
| `/api/admin/pages/:id/versions` | `GET` | Listar versões |
| `/api/admin/pages/:id/versions/:versionId` | `POST` | Restaurar versão no rascunho |
| `/api/admin/reusable-sections` | `GET/POST` | Listar ou criar modelos internos |
| `/api/admin/reusable-sections/:id` | `DELETE` | Excluir modelo interno |

### Criar página

```json
{"title":"Sobre a GTChat","template":"content-image"}
```

Resposta `201`: `{"id":2,"slug":"sobre-a-gtchat"}`.

### Salvar ou publicar

```json
{
  "title":"Sobre a GTChat",
  "slug":"sobre",
  "seo_title":"Sobre a GTChat",
  "seo_description":"Conheça nossa plataforma.",
  "document":{"version":1,"sections":[]},
  "mode":"publish"
}
```

`mode` aceita `autosave`, `save`, `publish` e `archive`. O documento aceita no máximo 50 seções, quatro colunas por seção, 30 elementos por coluna e 300 KB.

Erros: `400` documento inválido, `401` sem sessão, `403` origem inválida, `404` recurso ausente e `409` slug duplicado ou home protegida.

## 11. Lista de e-mails

### `POST /api/newsletter/subscribe`

Cadastro público. Exige `Content-Type: application/json` e mesma origem; não exige sessão.

```json
{
  "name": "Rafael",
  "email": "rafael@example.com",
  "consent": true,
  "source": "/artigos/exemplo",
  "website": ""
}
```

Sucesso `200`:

```json
{"ok":true,"message":"Cadastro realizado. Obrigado por acompanhar os conteúdos da GTChat!"}
```

O retorno é igual para contato novo, repetido ou reativado. Erros: `400` payload inválido, `403` origem inválida e `429` excesso de tentativas.

### `GET /api/admin/subscribers`

Exige sessão de administrador. Query params: `query`, `status=all|active|inactive`, `period=all|7|30|90` e `page`.

```json
{
  "items": [{"id":1,"name":"Rafael","email":"rafael@example.com","status":"active"}],
  "total": 1,
  "page": 1,
  "pages": 1,
  "pageSize": 20,
  "stats": {"active":1,"inactive":0,"recent":1}
}
```

### `PATCH /api/admin/subscribers/:id`

Exige administrador, JSON e mesma origem. Aceita pelo menos um dos campos:

```json
{"name":"Rafael Silva","email":"rafael@example.com","status":"inactive"}
```

Sucesso `200`: `{"ok":true}`. Erros: `400` dados inválidos, `401` sem permissão, `403` origem inválida, `404` ausente e `409` e-mail duplicado.

### `DELETE /api/admin/subscribers/:id`

Exclusão definitiva do inscrito e de seu histórico. Exige administrador e mesma origem. Retorna `{"ok":true}` ou `404`.

### `GET /api/admin/subscribers/export`

Exige administrador. Retorna CSV com BOM UTF-8 e `Content-Disposition: attachment`. Somente inscritos ativos são incluídos; células iniciadas por `=`, `+`, `-` ou `@` são neutralizadas.

### `GET /api/admin/newsletter-settings`

Retorna título, descrição, botão, consentimento e versão atuais. Exige administrador.

### `PUT /api/admin/newsletter-settings`

Exige administrador, JSON e mesma origem.

```json
{
  "title": "Conteúdos exclusivos",
  "description": "Receba novidades da GTChat.",
  "button_label": "Quero receber",
  "consent_text": "Aceito receber comunicações por e-mail."
}
```

Ao salvar, o servidor gera uma nova versão de consentimento. Sucesso `200`: `{"ok":true,"settings":{...}}`.
