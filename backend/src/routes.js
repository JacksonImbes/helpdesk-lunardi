import express from 'express';
// --- CORREÇÃO CRÍTICA ---
// Adicionada a extensão .js, que é obrigatória para importações de módulos locais em Node.js com "type": "module".
import authMiddleware from './middlewares/auth.js';

// Controllers
// --- CORREÇÃO CRÍTICA ---
// Adicionada a extensão .js a todas as importações de controllers.
import SessionController from './controllers/SessionController.js';
import UserController from './controllers/UserController.js';
import ChamadoController from './controllers/ChamadoController.js';
import CommentController from './controllers/CommentController.js';
import InventoryController from './controllers/InventoryController.js';
import ReportController from './controllers/ReportController.js';

const routes = express.Router();

// --- ROTAS PÚBLICAS ---
// Cria uma nova sessão (login)
routes.post('/sessions', SessionController.create);
// Cria um novo usuário
routes.post('/users', UserController.create);

// --- ROTAS PROTEGIDAS ---
// Rota para o frontend validar se um token ainda é ativo
routes.get('/sessions/validate', authMiddleware, (req, res) => {
  return res.status(200).send();
});

// --- ROTAS DE RELATÓRIOS ---
routes.get('/reports/chamados-por-dia', authMiddleware, ReportController.chamadosPorDia);

// --- ROTAS DE CHAMADOS ---
routes.get('/chamados/personal', authMiddleware, ChamadoController.personal);
routes.get('/chamados/stats', authMiddleware, ChamadoController.stats);
routes.get('/chamados', authMiddleware, ChamadoController.index);
routes.get('/chamados/:id', authMiddleware, ChamadoController.show);
routes.post('/chamados', authMiddleware, ChamadoController.create);
routes.put('/chamados/:id', authMiddleware, ChamadoController.update);
routes.delete('/chamados/:id', authMiddleware, ChamadoController.destroy);

// --- ROTAS DE COMENTÁRIOS ---
routes.post('/chamados/:chamado_id/comments', authMiddleware, CommentController.create);

// --- ROTAS DE INVENTÁRIO ---
routes.get('/inventory', authMiddleware, InventoryController.index);
routes.post('/inventory', authMiddleware, InventoryController.create);
routes.put('/inventory/:id', authMiddleware, InventoryController.update);
routes.delete('/inventory/:id', authMiddleware, InventoryController.destroy);

// --- ROTAS DE UTILIZADORES ---
routes.get('/users', authMiddleware, UserController.index);
routes.put('/users/:id', authMiddleware, UserController.update);
routes.delete('/users/:id', authMiddleware, UserController.destroy);

export default routes;
