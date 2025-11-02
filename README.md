# CRUD de Usuários (Vite + JSON Server)

Projeto completo com create/read/update/delete de usuários usando uma Fake API (JSON Server), seguindo boas práticas de estrutura, componentização, validação, estados de loading/erro, responsividade e acessibilidade.

## Stack
- Cliente: Vite (Vanilla + TypeScript)
- API: JSON Server (`/users`)
- Testes: Vitest

## Requisitos
- Node.js 18+

## Scripts
- `npm run dev:client` — inicia o cliente (`http://localhost:5173/`)
- `npm run dev:api` — inicia a Fake API (`http://localhost:3000/`) com delay simulado
- `npm run dev:all` — inicia cliente e API em paralelo
- `npm run build` — build de produção
- `npm run preview` — preview do build
- `npm run test` — testes unitários

## Endpoints
- `GET /users?_page=1&_limit=5&q=alice` — lista paginada com busca
- `GET /users/:id` — detalhe
- `POST /users` — cria
- `PUT /users/:id` — atualiza
- `DELETE /users/:id` — exclui

## Estrutura de Pastas
```
src/
  api/
    client.ts         # fetch wrapper + meta (headers)
    users.service.ts  # operações REST para /users
  core/
    dom.ts            # helpers de DOM
    modal.ts          # modal acessível + confirmação
    validation.ts     # validação de formulário
  styles/
    base.css          # estilos globais e utilitários
    app.css           # estilos específicos da app
  ui/
    app.ts            # página principal com CRUD completo
  main.ts             # entrypoint da aplicação

index.html
api-server.mjs        # (opcional, se usar json-server >=1)
db.json               # base de dados fake
```

## Boas Práticas Aplicadas
- Componentização e separação de responsabilidades
- Validação de formulários com mensagens claras
- Estados de loading e erro com retry
- Modal acessível (`role="dialog"`, `aria-modal`, foco)
- Responsividade com grid e controles acessíveis
- Paginação, busca e filtro por `q`
- Tipagem com TypeScript
- Testes unitários para validação

## Como rodar
1. Instalar dependências: `npm install`
2. Subir API: `npm run dev:api`
3. Subir cliente: `npm run dev:client`
4. Acessar a UI: `http://localhost:5173/`

Ou execute tudo junto:
```
npm run dev:all
```

## Publicar no GitHub
```
git init
git add .
git commit -m "CRUD de usuários (Vite + JSON Server)"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

Com GitHub CLI:
```
gh repo create SEU_REPO --source . --public --push
```

## Testes
```
npm run test
```

Caso precise, ajuste `db.json` com seus dados iniciais. O delay da API é simulado para aproximar uma experiência real.