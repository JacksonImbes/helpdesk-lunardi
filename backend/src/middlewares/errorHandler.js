const AppError = require('../errors/AppError');

function errorHandler(err, request, response, next) {
  // Se o erro for uma instância da nossa classe de erro personalizada...
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Log do erro no console para fins de depuração
  console.error(err);

  // Se for um erro inesperado, retorna um erro 500 genérico
  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}

module.exports = errorHandler;