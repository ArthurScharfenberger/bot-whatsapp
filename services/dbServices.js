const { getSheetSchema, TABELA_CLIENTES, TABELA_LOGS } = require('../config/sheetsMeta')
const { getClientes, selectUsersFiltered } = require('../services/googleSheets');
const express = require('express');
const knex = require('../database/connection')
const router = express.Router();
const logger = require('../utils/logger');

async function insetIntoClients(allCli) {
    try {
        for (const c of allCli) {
            try {
                await knex(TABELA_CLIENTES).insert({
                    name: c.Cliente,
                    phone: c.Telefone,
                    last_message: c.UltimaMensagem,
                    interval: c.IntervaloDias
                });
            } catch (err) {
                if (String(err.message).toUpperCase().includes('UNIQUE')) {
                    logger.error('Erro ao buscar/inserir clientes', { erro: err.message })
                    const e = new Error(`Telefone duplicado: ${c.Telefone} (cliente: ${c.Cliente})`);
                    e.code = 'DUPLICATE_PHONE';
                    throw e;
                }
            }
        }

        return {
            status: 'ok',
            total: allCli.length,
            clientes: allCli
        };

    } catch (err) {
        logger.error('Erro ao buscar/inserir clientes', { erro: err.message });
        return { error: err.message };
    }
}
async function truncateTable(table) {
    try {
        const result = await knex(table).truncate();
        logger.info(`Dados da tabela ${table} deletados`, { Result: result })
    } catch (err) {
        logger.error(`Erro ao deletar dados da tabela ${table}`, { erro: err.message })
        return
    }
}

module.exports = { insetIntoClients, truncateTable };