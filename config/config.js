require('dotenv').config();

function ensureEnv(name, fallback = undefined) {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }
  return value;
}

module.exports = {
  PORT: process.env.PORT || 3000,
  API_TOKEN: ensureEnv('API_TOKEN', 'changeme'),
  REQUIRE_AUTH: process.env.REQUIRE_AUTH !== 'false',
  DEFAULT_INTERVAL_DAYS: Number(process.env.DEFAULT_INTERVAL_DAYS) || 5,
  FILE_PATH: process.env.FILE_PATH || './planilha_clientes.xlsx',
  SESSION_NAME: process.env.SESSION_NAME || 'bot-session',
  MESSAGE_INTERVAL: parseInt(process.env.MESSAGE_INTERVAL, 10) || 5000,
  GOOGLE_SHEET_ID: ensureEnv('GOOGLE_SHEET_ID') // ✅ garante que não fica vazio
};
