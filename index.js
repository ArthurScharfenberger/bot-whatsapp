require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const { PORT } = require('./config/config');
const { errorHandler } = require('./utils/errorHandler');
const { initWhatsApp } = require('./services/whatsapp');

const app = express();
app.use(express.json());

// rotas
app.use('/', require('./routes/status'));
app.use('/send', require('./routes/send'));
app.use('/check', require('./routes/check'));
// app.use('/debug', require('./routes/debug')); // opcional: crie o arquivo se quiser

// erro global
app.use(errorHandler);

(async () => {
  try {
    logger.info('🚀 Inicializando cliente WhatsApp...');
    await initWhatsApp();
    logger.info('📲 Cliente WhatsApp inicializado');

    app.listen(PORT, () => {
      logger.info(`🟢 API rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('❌ Erro crítico na inicialização', { erro: err.message });
    process.exit(1);
  }
})();
