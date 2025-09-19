const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { getClient } = require('../services/whatsapp');
const { appendLog } = require('../services/googleSheets');
const { now, toDateOnlyString } = require('../utils/date');

router.post('/', async (req, res) => {
  const { telefone, mensagem } = req.body;

  if (!telefone || !mensagem) {
    return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
  }

  try {
    const client = getClient();
    const jid = `55${String(telefone).replace(/\D/g, '')}@c.us`;
    await client.sendMessage(jid, mensagem);

    // ✅ também grava no Google Sheets
    await appendLog(
      '', // Cliente pode ser buscado de getClientes depois, se quiser
      telefone,
      toDateOnlyString(now()),
      mensagem,
      '✅ ENVIADO'
    );

    logger.info('Mensagem enviada manualmente e logada no Google Sheets', { telefone, mensagem });
    res.json({ status: 'ENVIADO', telefone, mensagem });
  } catch (err) {
    logger.error('Erro ao enviar mensagem manual', { telefone, erro: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
