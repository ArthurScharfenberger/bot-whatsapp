const express = require('express');
const router = express.Router();
const { runScheduledCheck } = require('../services/scheduler');
const logger = require('../utils/logger');

async function handleCheck(req, res) {
  try {
    const results = await runScheduledCheck({ dryRun: true });
    logger.info('Verificação de clientes executada');
    res.json({ status: 'ok', results });
  } catch (err) {
    logger.error('Erro ao rodar verificação', { erro: err.message });
    res.status(500).json({ error: err.message });
  }
}

router.get('/', handleCheck);
router.post('/', handleCheck); // agora aceita POST também 🚀

module.exports = router;
