const connection = require('../database/connection');
const bcrypt = require('bcryptjs');

module.exports = {
  async index(request, response) {
    const users = await connection('users').select(
      'id', 'name', 'email', 'role', 'cpf', 'phone', 'admission_date', 'position', 'department', 'status'
    );
    return response.json(users);
  },

  async create(request, response) {
      const {
        name, email, password, role, cpf, phone, admission_date, position, department, status
      } = request.body;

      if (!name || !email || !password) {
        return response.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
      }

      const userExists = await connection('users').where('email', email).first();
      if (userExists) {
        return response.status(400).json({ error: 'E-mail já cadastrado.' });
      }

      const hashedPassword = await bcrypt.hash(password, 8);

      const [id] = await connection('users').insert({
        name, email, password: hashedPassword, role, cpf, phone, admission_date, position, department, status
      });

      const newUser = await connection('users').where('id', id).first();
      delete newUser.password;

      return response.status(201).json(newUser);
  },

  async update(request, response) {
    const { id } = request.params;
    const { 
      name, email, role, cpf, phone, admission_date, position, department, status 
    } = request.body;
    const loggedUserId = request.userId;

    if (Number(id) === Number(loggedUserId)) {
      const loggedUser = await connection('users').where('id', loggedUserId).first();
      if (loggedUser.role === 'admin' && role !== 'admin') {
        const adminCount = await connection('users').where('role', 'admin').count({ total: 'id' }).first();
        if (adminCount.total <= 1) {
          return response.status(403).json({ error: 'Não pode remover a sua própria permissão de administrador, pois é o único.' });
        }
      }
    }

    await connection('users').where('id', id).update({
      name, email, role, cpf, phone, admission_date, position, department, status
    });

    const updatedUser = await connection('users').where('id', id).first();
    delete updatedUser.password
    return response.json(updatedUser);
  },

  async destroy(request, response) {
    const { id } = request.params;
    const loggedUser = request.user;

    if (Number(id) === Number(loggedUser.id)) {
      return response.status(403).json({ error: 'Você não pode apagar a sua própria conta.' });
    }

    // Futuramente, adicionar verificação para não apagar o último admin

    const operation = await connection('users').where('id', id).delete();

    if (operation === 0) {
      return response.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    return response.status(204).send();
  }
};