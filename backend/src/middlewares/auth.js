import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../config/auth.js';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // --- A CORREÇÃO ESTÁ AQUI ---
    // Anexamos os dados decifrados do token (que incluem o id e a role)
    // a 'req.user', para que os controllers possam usá-los.
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
};