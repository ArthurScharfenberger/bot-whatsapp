// config/sheetsMeta.js
const { google } = require('googleapis');
const path = require('path');
const logger = require('../utils/logger');
const { GOOGLE_SHEET_ID } = require('./config');

const TABELA_CLIENTES = "Clientes"
const TABELA_LOGS = "Logs"

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, './google-credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const schemaCache = {};

//tabName é o nome da planilha, como "Clientes" ou "Logs"
async function getSheetSchema(tabName) {//pega da planilha o nome, numero e range de colunas
  if (schemaCache[tabName]) {
    return schemaCache[tabName];
  }

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `${tabName}!1:1` 
  });

  const headerRow = res.data.values ? res.data.values[0] : [];
  const colunas = headerRow.filter(c => c && c.trim() !== ''); // nomes das colunas

  const total = colunas.length; //num de colunas

  const lastColLetter = String.fromCharCode('A'.charCodeAt(0) + total - 1);
  const range = `${tabName}!A:${lastColLetter}`; //range (ex: Clientes!A:D)

  const schema = {
    tabName,
    colunas,
    total,
    range
  };

  schemaCache[tabName] = schema;
  logger.info('Schema de planilha carregado', schema);
  return schema;
}//getSheetSchema end

module.exports = {
                    getSheetSchema, 
                    auth, 
                    TABELA_CLIENTES, 
                    TABELA_LOGS
                 };
