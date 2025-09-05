import connection from '../database/connection.js';
import bcrypt from 'bcryptjs';

export default {
  /**
   * Lista todos os usuários.
   */
  async index(request, response) {
    try {
      const users = await connection('users').select(
        'id', 'name', 'email', 'role', 'cpf', 'phone', 'admission_date', 'position', 'department', 'status'
      );
      return response.json(users);
    } catch(err) {
      console.error('Erro ao listar usuários:', err);
      return response.status(500).json({ error: 'Falha ao listar usuários.' });
    }
  },

  /**
   * Cria um novo usuário.
   */
  async create(request, response) {
    const {
      name, email, password, cpf, phone, admission_date, position, department, status
    } = request.body;
    
    if (!name || !email || !password) {
      return response.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }
    
    try {
      const userExists = await connection('users').where('email', email).first();
      if (userExists) {
        return response.status(400).json({ error: 'E-mail já cadastrado.' });
      }

      // Define o primeiro usuário cadastrado como 'admin'
      const userCountResult = await connection('users').count('id as total').first();
      const userCount = parseInt(userCountResult.total, 10);
      const role = userCount === 0 ? 'admin' : 'user';

      const hashedPassword = await bcrypt.hash(password, 12);

      const [newUser] = await connection('users').insert({
        name, 
        email, 
        password: hashedPassword, 
        role, 
        cpf, 
        phone, 
        admission_date, 
        position, 
        department, 
        status
      }).returning(['id', 'name', 'email', 'role', 'status']);
      
      return response.status(201).json(newUser);

    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      return response.status(500).json({ error: 'Falha ao criar usuário.' });
    }
  },

  /**
   * Atualiza um usuário existente.
   */
  async update(request, response) {
    const { id } = request.params;
    let { 
      name, email, role, password, ...outrosCampos 
    } = request.body; 
    
    try {
      const userToUpdate = await connection('users').where('id', id).first();
      if (!userToUpdate) {
        return response.status(404).json({ error: 'Usuário não encontrado.' });
      }
      
      const dadosParaAtualizar = { name, email, role, ...outrosCampos };

      // Se uma nova senha for fornecida, faz o hash dela
      if (password) {
        dadosParaAtualizar.password = await bcrypt.hash(password, 12);
      }
      
      // Lógica para não permitir a remoção do último administrador
      if (userToUpdate.role === 'admin' && role !== 'admin') {
        const adminCountResult = await connection('users').where('role', 'admin').count('id as total').first();
        if (parseInt(adminCountResult.total, 10) <= 1) {
          return response.status(403).json({ error: 'Não é possível remover a permissão do único administrador.' });
        }
      }

      await connection('users').where('id', id).update(dadosParaAtualizar);

      const updatedUser = await connection('users').where('id', id).select('id', 'name', 'email', 'role', 'status').first();
      return response.json(updatedUser);
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      return response.status(500).json({ error: 'Falha ao atualizar usuário.' });
    }
  },

  /**
   * Apaga um usuário.
   */
  async destroy(request, response) {
    const { id } = request.params;
    const loggedUser = request.user;

    if (Number(id) === Number(loggedUser.id)) {
      return response.status(403).json({ error: 'Você não pode apagar a sua própria conta.' });
    }

    try {
      const operation = await connection('users').where('id', id).delete();

      if (operation === 0) {
        return response.status(404).json({ error: 'Utilizador não encontrado.' });
      }

      return response.status(204).send();
    } catch(err) {
      console.error('Erro ao apagar usuário:', err);
      return response.status(500).json({ error: 'Falha ao apagar usuário.' });
    }
  }
};