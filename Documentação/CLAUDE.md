# Guia para agentes de IA — GTChat Blog

> Documento operacional para agentes de IA que atuem neste repositório. Leia este arquivo, `RULES.md` e a documentação específica da área antes de alterar o projeto.

## 1. Objetivo do projeto

O **GTChat Blog** é uma plataforma editorial em português do Brasil formada por:

- blog público responsivo;
- área de publicação para redatores;
- fluxo de revisão e aprovação por administradores;
- editor visual de artigos com Tiptap;
- painel administrativo para usuários, configurações e aparência;
- persistência local em SQLite 3;
- uploads persistidos no sistema de arquivos;
- execução local no Windows e implantação em um servidor Linux.

Rotas principais:

| Área | Rotas |
|---|---|
| Blog público | `/`, `/artigos`, `/artigos/[slug]` |
| Autenticação | `/entrar` |
| Redação | `/publicar`, `/publicar/novo`, `/publicar/[id]` |
| Administração | `/admin`, `/admin/artigos`, `/admin/usuarios`, `/admin/aparencia`, `/admin/configuracoes` |

## 2. Stack utilizada

- **Next.js** com App Router e renderização no servidor.
- **React** e **TypeScript** em modo estrito.
- **CSS global** em `app/globals.css` e responsividade em `app/responsive.css`.
- **Tailwind CSS** disponível no build, embora a interface atual use principalmente classes CSS próprias.
- **SQLite 3** por meio de `better-sqlite3`.
- **Drizzle ORM/Kit** para definição de schema e migrations.
- **Tiptap** para edição rica de artigos.
- **Zod** para validação de payloads de API.
- **sanitize-html** para higienização do HTML público.
- **Lucide React** para ícones.
- **Vitest** para testes automatizados.
- **Docker** e Docker Compose para implantação Linux.

## 3. Estrutura de pastas

```text
GTblog/
├── app/                     # Páginas, layouts, CSS e Route Handlers
│   ├── admin/               # Páginas exclusivas do administrador
│   ├── api/                 # Endpoints internos
│   ├── artigos/             # Arquivo e artigo público
│   ├── publicar/            # Área editorial autenticada
│   ├── globals.css          # Base visual e layout principal
│   └── responsive.css       # Menus e adaptações responsivas
├── components/              # Componentes React compartilhados
├── db/schema.ts             # Schema declarativo do Drizzle
├── drizzle/                 # Migrations SQL versionadas
├── lib/                     # Banco, autenticação, segurança e regras comuns
├── scripts/                 # Migração, seed e administração local
├── public/                  # Arquivos públicos versionados
├── data/                    # SQLite e uploads; nunca versionar
├── Documentação/            # Documentação técnica do projeto
├── Dockerfile
├── compose.yml
└── package.json
```

Consulte detalhes em [ARCHITECTURE.md](./ARCHITECTURE.md).

## 4. Convenções de código

### TypeScript

- Manter `strict: true`.
- Evitar `any`; prefira tipos explícitos, `unknown` com narrowing ou tipos derivados.
- Usar o alias `@/` para imports internos.
- Componentes exportados usam **PascalCase**.
- Funções, variáveis e arquivos utilitários usam **camelCase**.
- Constantes globais usam **UPPER_SNAKE_CASE**.
- Valores de domínio persistidos continuam em português e `snake_case`, por exemplo `em_revisao`.

```ts
import { requireUser } from "@/lib/auth";

type ArticleSummary = {
  id: number;
  title: string;
  status: "rascunho" | "em_revisao" | "publicado";
};
```

### React e Next.js

- Páginas e componentes são **Server Components** por padrão.
- Adicionar `"use client"` somente quando houver estado, eventos, efeitos ou API do navegador.
- Validar autenticação no servidor; ocultar um botão no cliente não é controle de acesso.
- Usar `Link` para navegação interna.
- Usar Route Handlers em `app/api/**/route.ts` para mutações.

### SQL

- Usar consultas parametrizadas do `better-sqlite3`.
- Nunca interpolar entrada do usuário diretamente em SQL.
- Agrupar múltiplas gravações relacionadas em `db.transaction`.
- Atualizar `db/schema.ts` e criar migration em `drizzle/` quando o banco mudar.

## 5. Como criar novas funcionalidades

1. Confirmar o comportamento atual e identificar os módulos envolvidos.
2. Definir autorização: visitante, redator ou administrador.
3. Definir dados, validação e estados de erro.
4. Reutilizar componentes, tokens e padrões existentes.
5. Implementar a regra no servidor antes da interface.
6. Adicionar testes proporcionais ao risco.
7. Verificar desktop e celular.
8. Executar `npm test` e `npm run build`.
9. Atualizar a documentação afetada.

Exemplo de nova configuração administrativa:

```ts
// 1. Adicione a chave permitida no endpoint.
const allowed = new Set(["site_title", "nova_chave"]);

// 2. Adicione o padrão centralizado.
export const DEFAULT_THEME_SETTINGS = {
  // ...
  nova_chave: "Valor padrão",
};

// 3. Exponha o campo em um componente cliente e salve pelo endpoint existente.
```

## 6. Como escrever componentes

- Um componente deve ter um objetivo principal.
- Props devem ser pequenas, tipadas e previsíveis.
- Dados sensíveis e consultas devem permanecer em Server Components.
- Componentes clientes recebem apenas os dados necessários.
- Estados de carregamento, erro, vazio e desabilitado devem ser previstos.
- Elementos interativos precisam de nome acessível e área confortável para toque.
- Reutilize `.btn`, `.input`, `.panel`, `.status`, `.responsive-table` e demais padrões existentes.

```tsx
type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return <section className="empty" aria-live="polite">
    <h2>{title}</h2>
    <p>{description}</p>
  </section>;
}
```

Não crie um componente se ele for usado uma única vez e a extração não melhorar legibilidade, teste ou reutilização.

## 7. Como lidar com bugs

1. Reproduzir o problema na menor condição possível.
2. Registrar rota, perfil de usuário, largura de tela e estado do artigo.
3. Identificar a causa, não apenas o sintoma visual.
4. Verificar se o bug afeta autorização, persistência ou conteúdo público.
5. Aplicar a menor correção segura.
6. Testar a correção e cenários vizinhos.
7. Criar teste de regressão quando a regra puder ser automatizada.

Exemplo para overflow:

```css
.form-grid > *,
.form-grid .field {
  min-width: 0;
}
```

Além da correção visual, conferir `scrollWidth <= clientWidth` nas larguras suportadas.

## 8. Como criar commits

- Um commit deve representar uma unidade lógica.
- Usar mensagem curta no imperativo ou presente, em português.
- Não misturar refatoração ampla com correção pontual.
- Nunca incluir `.env`, banco, uploads ou credenciais.

Exemplos:

```text
Adiciona filtro por categoria aos artigos
Corrige cortes no editor de aparência
Documenta endpoints administrativos
```

Antes do commit:

```bash
npm test
npm run build
git diff --check
git status --short
```

## 9. Como responder quando faltar contexto

- Primeiro, procure a resposta no código, migrations, documentação e histórico local.
- Faça uma suposição somente se ela for reversível, segura e não alterar o objetivo.
- Declare a suposição quando ela afetar comportamento ou dados.
- Faça uma pergunta curta apenas quando escolhas diferentes produzirem resultados materialmente diferentes.
- Nunca invente credenciais, regras de negócio, endpoints ou estrutura de banco.

Resposta recomendada:

> Não encontrei no projeto a regra para expiração de convites. Posso seguir com 24 horas, mas isso altera o comportamento de segurança. Qual duração você prefere?

## 10. Boas práticas obrigatórias

- Preservar português do Brasil na interface.
- Manter o blog utilizável a partir de 360 px.
- Validar sessão, função e propriedade do recurso no servidor.
- Aplicar `sameOrigin` nas mutações autenticadas.
- Validar payloads com Zod.
- Sanitizar HTML antes de persistir ou publicar.
- Usar queries parametrizadas.
- Armazenar apenas hash de sessão e hash de senha.
- Manter banco e uploads em `data/` ou volume persistente.
- Centralizar padrões visuais em `lib/theme.ts`.
- Incluir texto alternativo em imagens de conteúdo.
- Respeitar foco, teclado, Escape e redução de movimento.
- Atualizar documentação, testes e migrations junto com a funcionalidade.

## 11. O que nunca deve ser feito

- Nunca versionar `.env`, `data/`, SQLite, uploads, tokens ou senhas.
- Nunca confiar apenas em validação do cliente.
- Nunca permitir que um redator publique diretamente.
- Nunca permitir que um redator altere artigo de outro autor.
- Nunca salvar HTML do editor sem sanitização.
- Nunca aceitar CSS ou JavaScript arbitrário no editor de tema.
- Nunca concatenar entrada do usuário em SQL, HTML, caminhos ou comandos.
- Nunca alterar o schema sem migration.
- Nunca remover dados ou sobrescrever mudanças existentes sem autorização.
- Nunca adicionar dependência para resolver algo simples já atendido pela stack.
- Nunca finalizar uma tarefa com build quebrado ou alterações não revisadas.

## 12. Ordem de leitura recomendada

1. `CLAUDE.md` — contexto operacional.
2. `RULES.md` — regras obrigatórias.
3. `ARCHITECTURE.md` — arquitetura e fluxos.
4. `API.md` — contratos HTTP.
5. `COMPONENTS.md` — catálogo de componentes.
6. `DESIGN-SYSTEM.md` — padrões visuais.

