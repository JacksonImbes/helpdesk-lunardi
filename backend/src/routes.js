const express = require('express');
const { celebrate, Segments, Joi } = require('celebrate');

const authMiddleware = require('./middlewares/auth');

// Controllers
const SessionController = require('./controllers/SessionController');
const UserController = require('./controllers/UserController');
const ChamadoController = require('./controllers/ChamadoController');
const CommentController = require('./controllers/CommentController');
const InventoryController = require('./controllers/InventoryController');
const ReportController = require('./controllers/ReportController');

const routes = express.Router();

// --- ROTAS PÚBLICAS ---
routes.post('/sessions', SessionController.create);

routes.post('/users', celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    role: Joi.string().required().valid('admin', 'tech', 'user'),
    department: Joi.string().required(),
    phone: Joi.string().required(),
  })
}), UserController.create);


// --- ROTAS PROTEGIDAS ---

routes.get('/sessions/validate', authMiddleware, (req, res) => {
  return res.status(200).send();
});

// --- ROTAS DE DASHBOARD E RELATÓRIOS ---
routes.get('/dashboard/kpis', authMiddleware, ChamadoController.kpis);

// Rota para o relatório de chamados por dia, agora com validação de datas
routes.get('/dashboard/reports/chamados-por-dia', authMiddleware, celebrate({
  [Segments.QUERY]: Joi.object().keys({
    startDate: Joi.date().iso().required(), // Valida data no formato YYYY-MM-DD
    endDate: Joi.date().iso().required(),
  }),
}), ReportController.chamadosPorDia);


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

module.exports = routes;