const connection = require('../database/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = {
  async create(request, response) {
    const { email, password } = request.body;
    const user = await connection('users').where('email', email).first();
    
    if (!user) {
        return response.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        return response.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // O token só precisa do ID. A função será verificada na base de dados a cada pedido.
    const token = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    delete user.password;
    return response.json({ user, token });
  }
};