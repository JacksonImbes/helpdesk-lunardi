require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { errors } = require('celebrate');
const routes = require('./src/routes.js');
const errorHandler = require('./src/middlewares/errorHandler'); // Importe o novo middleware

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Middleware de erro de validação (do celebrate)
app.use(errors());

// Nosso novo middleware de erro global (deve ser o último)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend a rodar na porta ${PORT}`);
});

