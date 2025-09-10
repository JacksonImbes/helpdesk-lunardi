const connection = require('../database/connection');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const bcrypt = require('bcryptjs');
const AppError = require('../errors/AppError'); // Importe o AppError

module.exports = {
  async create(request, response) {
    // Note que removemos o try...catch!
    const { email, password } = request.body;

    const user = await connection('users')
      .where('email', email)
      .select('id', 'name', 'password', 'role')
      .first();

    if (!user) {
      // Lança um erro que será capturado pelo nosso middleware
      throw new AppError('Email ou palavra-passe inválidos', 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      // A mesma mensagem de erro para não dar pistas a atacantes
      throw new AppError('Email ou palavra-passe inválidos', 401);
    }

    const { id, name, role } = user;

    const token = jwt.sign({ id, name, role }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    delete user.password;

    return response.json({ user, token });
  },
};