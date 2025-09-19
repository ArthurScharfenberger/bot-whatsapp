const logger = require('./logger');

function errorHandler(err, req, res, next) {
  logger.error('Erro não tratado', { erro: err.message, stack: err.stack });
  res.status(500).json({ error: 'Erro interno do servidor' });
}

module.exports = { errorHandler };
