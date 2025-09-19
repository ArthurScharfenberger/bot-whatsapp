const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');
const { SESSION_NAME } = require('../config/config');

let client;

function getClient() {
  if (!client) throw new Error('WhatsApp client ainda não inicializado');
  return client;
}

async function initWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth({ clientId: SESSION_NAME }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  });

  client.on('qr', (qr) => {
    logger.info('QRCode gerado (escaneie no app do WhatsApp).');
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => logger.info('✅ Autenticado no WhatsApp'));
  client.on('auth_failure', (m) => logger.error('❌ Falha de autenticação', { msg: m }));
  client.on('ready', () => logger.info('🟢 WhatsApp pronto'));
  client.on('disconnected', (r) => logger.warn('⚠️ Desconectado', { reason: r }));

  await client.initialize();
  return client;
}

module.exports = { initWhatsApp, getClient };
