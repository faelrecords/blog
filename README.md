# GTChat Blog

Blog e plataforma editorial da GTChat, com Next.js, SQLite 3, autenticação própria, fluxo de revisão e editor visual do tema.

## Rodar no Windows

1. Instale as dependências: `npm install`
2. Prepare o banco: `npm run db:migrate`
3. Crie os dados de demonstração: `npm run db:seed`
4. Inicie: `npm run dev`
5. Abra `http://localhost:3000`

Contas da demonstração:

- Administrador: `admin` / `GTChat@2026`
- Redator: `redatora` / `Redatora@2026`

Troque as senhas antes de expor o sistema fora de uma demonstração controlada.

## Demonstração remota temporária

Com a aplicação rodando, use `npx wrangler tunnel quick-start http://localhost:3000`. O endereço `trycloudflare.com` existe apenas enquanto o processo estiver aberto. Encerre-o após a apresentação.

## Produção Linux

Copie `.env.example` para `.env`, defina `APP_URL=https://blog.vibecodex.pro` e execute `docker compose up -d --build`. O volume `blog_data` mantém banco e imagens entre atualizações. Coloque Nginx ou Caddy com HTTPS na frente da porta 3000.

No primeiro início, preencha temporariamente `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_USERNAME` e `BOOTSTRAP_ADMIN_PASSWORD` no `.env`. Depois de confirmar o acesso, remova esses valores. Em uma instalação direta pelo código-fonte, `npm run admin:create` também cria um administrador de forma interativa. Não use as credenciais de demonstração em produção.

## Dados e backup

- Banco: `data/blog.sqlite`
- Imagens: `data/uploads/`
- Backup seguro: pare brevemente a aplicação ou use o comando `.backup` do SQLite, e copie também a pasta de uploads.
- Nunca envie `data/` ou arquivos `.env` ao GitHub.

## Verificações

- `npm test`
- `npm run build`
