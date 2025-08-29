const express = require('express');
const ChamadoController = require('./controllers/ChamadoController');
const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');
const InventoryController = require('./controllers/InventoryController');
const CommentController = require('./controllers/CommentController');
const authMiddleware = require('./middlewares/auth');

const routes = express.Router();

// --- ROTAS PÚBLICAS ---
routes.post('/sessions', SessionController.create);

// --- ROTAS PROTEGIDAS (Acessíveis por qualquer utilizador logado) ---
routes.get('/chamados/stats', authMiddleware(), ChamadoController.stats);
routes.get('/chamados', authMiddleware(['admin', 'technician', 'user']), ChamadoController.index);
routes.post('/chamados', authMiddleware(), ChamadoController.create);
routes.get('/chamados/:id', authMiddleware(), ChamadoController.show);
routes.put('/chamados/:id', authMiddleware(), ChamadoController.update);
routes.delete('/chamados/:id', authMiddleware(), ChamadoController.destroy);
routes.post('/chamados/:chamado_id/comments', authMiddleware(), CommentController.create);
routes.get('/inventory', authMiddleware(), InventoryController.index);
// routes.get('/technicians', authMiddleware(), UserController.indexTechnicians);

// --- ROTAS DE ADMINISTRAÇÃO (Acessíveis apenas por 'admin' ou 'technician') ---
routes.post('/inventory', authMiddleware(['admin', 'technician']), InventoryController.create);

// --- ROTAS DE ADMINISTRAÇÃO (Acessíveis apenas por 'admin') ---
routes.get('/users', authMiddleware(['admin']), UserController.index);
routes.post('/users', authMiddleware(['admin']), UserController.create);
routes.put('/users/:id', authMiddleware(['admin']), UserController.update);
routes.delete('/users/:id', authMiddleware(['admin']), UserController.destroy);

module.exports = routes;