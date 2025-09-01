const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const connection = require('../database/connection'); // Precisamos de aceder à base de dados

// O middleware agora pode receber uma lista de funções permitidas
module.exports = (roles) => async (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ error: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, authConfig.secret);

    // Buscamos os dados mais recentes do utilizador na base de dados
    const user = await connection('users').where('id', decoded.id).select('id', 'role').first();

    if (!user) {
      return response.status(401).json({ error: 'Utilizador do token não encontrado.' });
    }

    request.user = user;

    // Se a rota exige funções específicas, verificamos se o utilizador tem permissão
    if (!roles) {
      return next();
    }

    // Se 'roles' foi fornecido, verificamos a permissão.
    if (!roles.includes(user.role)) {
      return response.status(403).json({ error: 'Acesso negado. Permissões insuficientes.' });
    }

    return next();
  } catch (err) {
    return response.status(401).json({ error: 'Token inválido.' });
  }
};