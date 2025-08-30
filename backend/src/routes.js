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
routes.get('/chamado/stats', authMiddleware(), ChamadoController.stats);
routes.get('/chamado', authMiddleware(['admin', 'technician', 'user']), ChamadoController.index);
routes.post('/chamado', authMiddleware(), ChamadoController.create);
routes.get('/chamado/:id', authMiddleware(), ChamadoController.show);
routes.put('/chamado/:id', authMiddleware(), ChamadoController.update);
routes.delete('/chamado/:id', authMiddleware(), ChamadoController.destroy);
routes.post('/chamado/:chamado_id/comments', authMiddleware(), CommentController.create);
routes.get('/inventario', authMiddleware(), InventoryController.index);
// routes.get('/technicians', authMiddleware(), UserController.indexTechnicians);

// --- ROTAS DE ADMINISTRAÇÃO (Acessíveis apenas por 'admin' ou 'technician') ---
routes.post('/inventario', authMiddleware(['admin', 'technician']), InventoryController.create);

// --- ROTAS DE ADMINISTRAÇÃO (Acessíveis apenas por 'admin') ---
routes.get('/users', authMiddleware(['admin']), UserController.index);
routes.post('/users', authMiddleware(['admin']), UserController.create);
routes.put('/users/:id', authMiddleware(['admin']), UserController.update);
routes.delete('/users/:id', authMiddleware(['admin']), UserController.destroy);

module.exports = routes;