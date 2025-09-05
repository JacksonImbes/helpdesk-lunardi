import 'dotenv/config';

export default {
  secret: process.env.JWT_SECRET || 'fallback_secret_para_desenvolvimento',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};