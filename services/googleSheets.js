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

async function updateLastSent(telefone, data) {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // 1) Ler a aba Clientes
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Clientes!A:D'
    });

    const rows = res.data.values || [];
    if (!rows.length) {
      logger.warn('Clientes: planilha vazia ao tentar atualizar UltimaMensagem');
      return;
    }

    const headers = rows[0];
    const idxTelefone = headers.indexOf('Telefone');
    const idxUltimaMensagem = headers.indexOf('UltimaMensagem');

    if (idxTelefone === -1 || idxUltimaMensagem === -1) {
      logger.error('Cabeçalhos não encontrados na planilha Clientes', { headers });
      return;
    }

    // 2) Procurar a linha do cliente pelo telefone
    const telNormalizado = String(telefone).replace(/\D/g, '');
    let targetRowNumber = null; // número da linha no Google Sheets (1-based)

    for (let i = 1; i < rows.length; i++) { // começa em 1 por causa do cabeçalho
      const telLinha = (rows[i][idxTelefone] || '').toString().replace(/\D/g, '');
      if (telLinha === telNormalizado) {
        targetRowNumber = i + 1; // +1 porque o índice do array começa em 0
        break;
      }
    }

    if (!targetRowNumber) {
      logger.warn('Cliente não encontrado para atualizar UltimaMensagem', { telefone });
      return;
    }

    // 3) Descobrir letra da coluna da UltimaMensagem (A=0, B=1, C=2...)
    const colLetter = String.fromCharCode('A'.charCodeAt(0) + idxUltimaMensagem);
    const range = `Clientes!${colLetter}${targetRowNumber}`;

    // 4) Atualizar a célula
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[data]]
      }
    });

    logger.info('UltimaMensagem atualizada na planilha', { telefone, data, range });
  } catch (e) {
    logger.error('Erro ao atualizar UltimaMensagem no Google Sheets', { erro: e.message });
  }
}


module.exports = { getClientes, appendLog, updateLastSent };
