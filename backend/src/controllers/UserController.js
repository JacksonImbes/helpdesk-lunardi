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
      name, email, password, cpf, phone, admission_date, position, department, status
    } = request.body;
    
    // PEGADINHA DE SEGURANÇA: ignoramos a 'role' que vem do corpo da requisição.
    // A 'role' só pode ser definida por um admin na tela de edição.
    // Ou, se quisermos, podemos definir a primeira pessoa a se cadastrar como admin.
    
    if (!name || !email || !password) {
      return response.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }
    
    try {
      const userExists = await connection('users').where('email', email).first();
      if (userExists) {
        return response.status(400).json({ error: 'E-mail já cadastrado.' });
      }

      // LÓGICA DO PRIMEIRO ADMIN: Se não houver nenhum usuário, o primeiro a se cadastrar se torna admin.
      const userCount = await connection('users').count('id as total').first();
      const role = userCount.total === 0 ? 'admin' : 'user';

      const hashedPassword = await bcrypt.hash(password, 12);
      
      const [id] = await connection('users').insert({
        name, email, password: hashedPassword, role, cpf, phone, admission_date, position, department, status
      });

      const newUser = await connection('users').where('id', id).select('id', 'name', 'email', 'role', 'status').first();
      
      return response.status(201).json(newUser);
    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao criar usuário.' });
    }
  },

  async update(request, response) {
    const { id } = request.params;
    let { 
      name, email, role, password, ...outrosCampos 
    } = request.body; // Agora aceitamos a senha
    
    try {
      const userToUpdate = await connection('users').where('id', id).first();
      if (!userToUpdate) return response.status(404).json({ error: 'Usuário não encontrado.' });
      
      const dadosParaAtualizar = { name, email, role, ...outrosCampos };

      // Se uma nova senha for fornecida, fazemos o hash dela.
      if (password) {
        dadosParaAtualizar.password = await bcrypt.hash(password, 12);
      }
      
      // ... sua lógica excelente para não remover o último admin ...
      if (userToUpdate.role === 'admin' && role !== 'admin') {
        const adminCount = await connection('users').where('role', 'admin').count('id as total').first();
        if (adminCount.total <= 1) {
          return response.status(403).json({ error: 'Não é possível remover a permissão do único administrador.' });
        }
      }

      await connection('users').where('id', id).update(dadosParaAtualizar);

      const updatedUser = await connection('users').where('id', id).select('id', 'name', 'email', 'role', 'status').first();
      return response.json(updatedUser);
    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: 'Falha ao atualizar usuário.' });
    }
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