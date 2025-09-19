function buildAvisoMessage(c) {
  const nome = c.Cliente || 'cliente';
  return `Olá, ${nome}! Passando para te lembrar do nosso atendimento. Qualquer dúvida, estamos à disposição.`;
}

module.exports = { buildAvisoMessage };
