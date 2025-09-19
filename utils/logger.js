const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../logs.txt');

function writeLog(level, mensagem, extra = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    mensagem,
    ...extra
  };
  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
  } catch (e) {
    console.error('Falha ao gravar log:', e);
  }
  console.log(JSON.stringify(logEntry));
}

module.exports = {
  info: (mensagem, extra) => writeLog('INFO', mensagem, extra),
  warn: (mensagem, extra) => writeLog('WARN', mensagem, extra),
  error: (mensagem, extra) => writeLog('ERROR', mensagem, extra)
};
