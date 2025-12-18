const { google } = require('googleapis');
const logger = require('../utils/logger');
const { GOOGLE_SHEET_ID } = require('../config/config')

const { getSheetSchema, auth, TABELA_CLIENTES, TABELA_LOGS } = require('../config/sheetsMeta');

async function getClientes() {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const schema = await getSheetSchema(TABELA_CLIENTES);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: schema.range
    });

    const rows = res.data.values || [];
    if (!rows.length) return [];

    // remove cabeçalho
    rows.shift();

    return rows.map(r =>
      Object.fromEntries(schema.colunas.map((h, i) => [h, r[i] || '']))
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

    const logsSchema = await getSheetSchema(TABELA_LOGS);

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: logsSchema.range, // ex: Logs!A:E
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[cliente, telefone, data, status, mensagem]]
      }
    });

    logger.info('Log adicionado ao Google Sheets', { cliente, telefone });
  } catch (err) {
    logger.error('Erro ao escrever no Google Sheets', { erro: err.message });
  }
}

async function updateLastSent(telefone, data) { //Ao enviar uma msg (scheduler.js) altera a data do ultimo envio para a atual
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const schema = await getSheetSchema(TABELA_CLIENTES);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: schema.range
    });

    const rows = res.data.values || [];
    if (!rows.length) {
      logger.warn(`${TABELA_CLIENTES}: planilha vazia ao tentar atualizar UltimaMensagem`);
      return;
    }

    const headers = schema.colunas;
    const idxTelefone = headers.indexOf('Telefone');
    const idxUltimaMensagem = headers.indexOf('UltimaMensagem');

    if (idxTelefone === -1 || idxUltimaMensagem === -1) {
      logger.error('Cabeçalhos não encontrados na planilha Clientes', { headers });
      return;
    }

    const telNormalizado = String(telefone).replace(/\D/g, '');
    let targetRowNumber = null;

    // começa da linha 2 (linha 1 é cabeçalho)
    for (let i = 1; i < rows.length; i++) {
      const telLinha = (rows[i][idxTelefone] || '').toString().replace(/\D/g, '');
      if (telLinha === telNormalizado) {
        targetRowNumber = i + 1;
        break;
      }
    }

    if (!targetRowNumber) {
      logger.warn('Cliente não encontrado para atualizar UltimaMensagem', { telefone });
      return;
    }

    const colLetter = String.fromCharCode('A'.charCodeAt(0) + idxUltimaMensagem);
    const range = `Clientes!${colLetter}${targetRowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[data]]
      }
    });

    logger.info('UltimaMensagem atualizada na planilha', { telefone, data, range });
  } catch (e) {
    logger.error('Erro ao atualizar UltimaMensagem no Google Sheets', { erro: e.message });
  }
}//updateLastSent end


module.exports = { getClientes, appendLog, updateLastSent };
