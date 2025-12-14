const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');
const { SESSION_NAME } = require('../config/config');

let client = null;
let initPromise = null;
let lastQrCode = null;
let isShuttingDown = false;

// flags de estado para evitar logs/qr duplicados
let hasAuthenticatedOnce = false;
let hasReadyOnce = false;

function getClient() {
  if (!client) throw new Error('WhatsApp client ainda não inicializado');
  return client;
}

async function initWhatsApp() {
  if (initPromise) return initPromise;
  if (client) return { client, qrCode: lastQrCode };

  initPromise = (async () => {
    isShuttingDown = false;
    lastQrCode = null;
    hasAuthenticatedOnce = false;
    hasReadyOnce = false;

    client = new Client({
      authStrategy: new LocalAuth({ clientId: SESSION_NAME }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    });

    client.on('qr', (qr) => {
      // ✅ Se já ficou pronto alguma vez, ignore QR “fantasma” do logout
      if (isShuttingDown || hasReadyOnce) return;

      lastQrCode = qr;
      logger.info('QRCode gerado');
      qrcode.generate(qr, { small: true });
    });

    client.on('authenticated', () => {
      // ✅ Evita duplicar “authenticated”
      if (isShuttingDown || hasAuthenticatedOnce) return;

      hasAuthenticatedOnce = true;
      logger.info('✅ Autenticado no WhatsApp');
    });

    client.on('ready', () => {
      // ✅ Evita duplicar “ready”
      if (isShuttingDown || hasReadyOnce) return;

      hasReadyOnce = true;
      logger.info('🟢 WhatsApp pronto');
    });

    client.on('disconnected', async (reason) => {
      logger.warn('⚠️ Desconectado', { reason });

      isShuttingDown = true;

      try {
        // remove listeners para não logar nada enquanto morre
        client.removeAllListeners();
        await client.destroy();
      } catch (_) {}

      client = null;
      initPromise = null;

      logger.info('🛑 Cliente finalizado. Aguardando nova inicialização manual.');
    });

    await client.initialize();
    return { client, qrCode: lastQrCode };
  })();

  return initPromise;
}

module.exports = { initWhatsApp, getClient };
