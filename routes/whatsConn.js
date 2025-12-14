const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { initWhatsApp } = require('../services/whatsapp');

let isConnecting = false;

router.get('/', async (req, res) => {
  if (isConnecting) {
    return res.status(409).json({ message: 'Já existe uma inicialização em andamento.' });
  }

  isConnecting = true; // ✅ trava correta

  try {
    logger.info('🚀 Inicializando cliente WhatsApp...');

    const reset = req.query.reset === '1';
    if (reset) {
      const authDir = path.resolve(process.cwd(), '.wwebjs_auth');
      await fs.promises.rm(authDir, { recursive: true, force: true });
      logger.info('🧹 pasta .wwebjs_auth apagada (reset=1)');
    }

    const { qrCode } = await initWhatsApp();

    return res.status(200).json({
      message: qrCode ? 'QR gerado. Escaneie no WhatsApp.' : 'Inicializado (sem QR).',
      qrCode: qrCode ?? null,
    });
  } catch (err) {
    logger.error('❌ Erro ao inicializar WhatsApp', { erro: err.message });
    return res.status(500).json({ error: err.message });
  } finally {
    isConnecting = false;
  }
});

module.exports = router;
