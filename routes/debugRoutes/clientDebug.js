const { getSheetSchema, TABELA_CLIENTES, TABELA_LOGS } = require('../../config/sheetsMeta')
const { getClientes, selectUsersFiltered } = require('../../services/googleSheets');
const express = require('express');
const knex = require('../../database/connection')
const router = express.Router();
const logger = require('../../utils/logger');

async function insetIntoClients() {
    try {
        const allCli = await getClientes();

        for (const c of allCli) {
            try {
                await knex('clients').insert({
                    name: c.Cliente,
                    phone: c.Telefone,
                    last_message: c.UltimaMensagem || null,
                    inteval: c.IntervaloDias || null
                });
            } catch (err) {
                if (!err.message.includes('UNIQUE')) {
                    throw err;
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
async function truncateClients() {
    try {
        await knex('clients').truncate();
    } catch (err) {
        return
    }
}

async function getCli(req, res) {
    dbTruncate = await truncateClients();
    logger.info('Truncate de clientes bem sucedido', dbTruncate)
    dbStatus = await insetIntoClients();
    logger.info('Insert de clientes bem sucedido', dbStatus)

    try {
        if (JSON.stringify(req.body) != "{}") {
            const filteredCli = await selectUsersFiltered(req.body)
            console.log(filteredCli)
            res.status(200).json({ filteredCli })
            return;
        }
        const selectAll = await knex('clients').select('*');
        res.status(200).json({"Clientes": selectAll})
    } catch(err){
        logger.error('Erro ao consultar clientes',{erro:err})
    }

    
}


router.get('/', getCli);



module.exports = router;