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

    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    delete user.password;
    return response.json({ user, token });
  }
};