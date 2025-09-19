const { DEFAULT_INTERVAL_DAYS } = require('../config/config');
const { now, addDays, toDateOnlyString, isSameOrAfter } = require('../utils/date');
const logger = require('../utils/logger');
const { getClientes, appendLog } = require('./googleSheets');
const { getClient } = require('./whatsapp');
const { buildAvisoMessage } = require('./messages');

function isEligible(client) {
  const phone = client.Telefone?.toString().trim();
  if (!phone) return { eligible: false, reason: 'Telefone inválido' };

  let lastSent = null;
  if (client.UltimaMensagem && client.UltimaMensagem.trim() !== '') {
    const parsed = new Date(client.UltimaMensagem);
    if (!isNaN(parsed.getTime())) lastSent = parsed;
  }

  const interval = Number(client.IntervaloDias) || DEFAULT_INTERVAL_DAYS;
  if (!lastSent) return { eligible: true, interval, reason: 'Nunca recebeu mensagem' };

  const nextAllowed = addDays(lastSent, interval);
  if (isSameOrAfter(now(), nextAllowed)) {
    return { eligible: true, interval, lastSentDate: lastSent, nextAllowedDate: toDateOnlyString(nextAllowed) };
  }

  return {
    eligible: false,
    interval,
    lastSentDate: lastSent,
    nextAllowedDate: toDateOnlyString(nextAllowed),
    reason: `Aguardando intervalo até ${toDateOnlyString(nextAllowed)}`
  };
}

async function runScheduledCheck({ dryRun = false } = {}) {
  logger.info('Executando verificação de clientes', { dryRun });
  const clientes = await getClientes();
  const results = [];
  const client = getClient();

  for (const c of clientes) {
    const check = isEligible(c);
    if (!check.eligible) {
      results.push({ telefone: c.Telefone, nome: c.Cliente, status: 'IGNORADO', ...check });
      continue;
    }

    const msg = buildAvisoMessage(c);

    if (dryRun) {
      results.push({ telefone: c.Telefone, nome: c.Cliente, status: 'SIMULADO', preview: msg });
      continue;
    }

    try {
      const jid = `55${String(c.Telefone).replace(/\D/g, '')}@c.us`;
      await client.sendMessage(jid, msg);
      await appendLog(c.Cliente, c.Telefone, toDateOnlyString(now()), msg, '✅ ENVIADO');
      results.push({ telefone: c.Telefone, nome: c.Cliente, status: 'ENVIADO', mensagem: msg });
    } catch (e) {
      logger.error('Erro ao enviar mensagem', { telefone: c.Telefone, erro: e.message });
      results.push({ telefone: c.Telefone, nome: c.Cliente, status: 'ERRO', erro: e.message });
    }
  }

  return results;
}

module.exports = { runScheduledCheck, isEligible };
