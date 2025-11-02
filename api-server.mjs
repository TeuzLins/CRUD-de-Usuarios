// Simple JSON Server with delay middleware (ESM)
import jsonServer from 'json-server';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Delay middleware ~800ms
server.use((req, res, next) => setTimeout(next, 800));
server.use(middlewares);
server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server rodando em http://localhost:${PORT}`);
});