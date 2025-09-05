import connection from '../database/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.js';

export default {
  /**
   * Cria uma nova sessão de usuário (login).
   */
  async create(request, response) {
    try {
      const { email, password } = request.body;
      const user = await connection('users').where('email', email).first();

      if (!user) {
        return response.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return response.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const payload = {
        id: user.id,
        role: user.role
      };

      // Usa as configurações centralizadas do 'auth.js'
      const token = jwt.sign(payload, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      // Remove a senha do objeto de usuário antes de enviá-lo na resposta
      delete user.password;

      return response.json({ user, token });

    } catch (err) {
      console.error('Erro no login:', err);
      return response.status(500).json({ error: 'Ocorreu uma falha interna no servidor.' });
    }
  }
};