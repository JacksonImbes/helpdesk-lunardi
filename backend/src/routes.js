const express = require('express');
const ChamadoController = require('./controllers/ChamadoController');
const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');
const InventoryController = require('./controllers/InventoryController');
const CommentController = require('./controllers/CommentController');
const authMiddleware = require('./middlewares/auth');

const routes = express.Router();

routes.post('/sessions', SessionController.create);

routes.post('/users', UserController.create);

routes.get('/chamado/stats', authMiddleware(), ChamadoController.stats);
routes.get('/chamado', authMiddleware(['admin', 'technician', 'user']), ChamadoController.index);
routes.post('/chamado', authMiddleware(), ChamadoController.create);
routes.get('/chamado/:id', authMiddleware(['admin', 'technician', 'user']), ChamadoController.show);
routes.put('/chamado/:id', authMiddleware(['admin', 'technician', 'user']), ChamadoController.update);
routes.post('/chamado/:chamado_id/comments', authMiddleware(), CommentController.create);

routes.get('/inventario', authMiddleware(['admin', 'technician', 'user']), InventoryController.index);
routes.post('/inventario', authMiddleware(['admin', 'technician']), InventoryController.create);
routes.put('/inventario/:id', authMiddleware(['admin', 'technician']), InventoryController.update);
routes.delete('/inventario/:id', authMiddleware(['admin', 'technician']), InventoryController.destroy);

routes.get('/users', authMiddleware(['admin']), UserController.index);
routes.put('/users/:id', authMiddleware(['admin']), UserController.update);
routes.delete('/users/:id', authMiddleware(['admin']), UserController.destroy);
routes.delete('/chamado/:id', authMiddleware(['admin']), ChamadoController.destroy);

module.exports = routes;