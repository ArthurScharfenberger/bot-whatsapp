const { google } = require('googleapis');
const path = require('path');
const logger = require('../utils/logger');
const { GOOGLE_SHEET_ID } = require('../config/config');
console.log("DEBUG -> GOOGLE_SHEET_ID:", GOOGLE_SHEET_ID); // deve mostrar o ID



console.log("GOOGLE_SHEET_ID carregado:", GOOGLE_SHEET_ID); // ✅ Debug

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/google-credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function getClientes() {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Clientes!A:D' // Ajuste conforme a aba da sua planilha
    });

    const rows = res.data.values || [];
    if (!rows.length) return [];

    const headers = rows.shift();
    return rows.map(r =>
      Object.fromEntries(headers.map((h, i) => [h, r[i] || '']))
    );
  } catch (err) {
    logger.error('Erro ao ler Google Sheets', { erro: err.message });
    return [];
  }
}

async function appendLog(cliente, telefone, data, mensagem, status) {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Logs!A:E', // ✅ precisa existir uma aba "Logs"
      valueInputOption: 'RAW',
      requestBody: {
        values: [[cliente, telefone, data, status, mensagem]]
      }
    });

    logger.info('Log adicionado ao Google Sheets', { cliente, telefone });
  } catch (err) {
    logger.error('Erro ao escrever no Google Sheets', { erro: err.message });
  }
}

module.exports = { getClientes, appendLog };
