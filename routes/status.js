const express = require('express');
const router = express.Router();
const { getClient } = require('../services/whatsapp');
const logger = require('../utils/logger');

router.get('/', (_req, res) => {
  try {
    const client = getClient();
    if (client && client.info) {
      logger.info('Status consultado', { status: 'conectado' });
      return res.json({ status: 'conectado', user: client.info });
    }
    logger.warn('Status consultado', { status: 'desconectado' });
    res.json({ status: 'desconectado' });
  } catch (err) {
    logger.error('Erro ao verificar status', { erro: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
