const {getSheetSchema, TABELA_CLIENTES, TABELA_LOGS} = require('../../config/sheetsMeta')
const {getClientes} = require('../../services/googleSheets');
const express = require('express');
const knex = require('../../database/connection');
const router = express.Router();
const logger = require('../../utils/logger');

async function getCli(req, res) {
  try {
    const allCli = await getClientes();

    for (const c of allCli) {
      await knex('clients')
        .insert({
          name: c.Cliente,
          phone: c.Telefone,
          last_message: c.UltimaMensagem,
          inteval: c.IntervaloDias
        })
        .onConflict('phone')
        .ignore();
    }

    return res.status(200).json({
      status: 'ok',
      total: allCli.length,
      clientes:allCli
    });

  } catch (err) {
    logger.error('Erro ao buscar/inserir clientes', { erro: err.message });
    return res.status(500).json({ error: err.message });
  }
}

router.get('/',getCli);
router.get('/:id',getCli);



module.exports = router;