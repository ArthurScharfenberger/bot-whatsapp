const { getSheetSchema, TABELA_CLIENTES, TABELA_LOGS } = require('../../config/sheetsMeta')
const { getClientes } = require('../../services/googleSheets');
const express = require('express');
const knex = require('../../database/connection')
const router = express.Router();
const logger = require('../../utils/logger');
const { insetIntoClients, truncateTable } = require('../../services/dbServices')

async function importCli(req, res) {

    try {
        const [allCli] = await Promise.all([
            getClientes(),
            truncateTable(TABELA_CLIENTES)
        ]);

        const dbStatus = await insetIntoClients(allCli);

        if (dbStatus.status != "ok") {
            logger.error('Erro no banco de dados', { error: dbStatus })
            res.status(500).json({ 'error': dbStatus });
            return;
        }

        logger.info('Sucesso na impotação', { info: dbStatus })
    } catch (err) {
        logger.error('Erro no banco de dados', { error: err })
        console.log(err)
        res.status(500).json({ 'error': err });
        return;
    }
}

async function getCli(req, res) {
    try {
        await importCli();
        const selectAll = await knex(TABELA_CLIENTES).select('*');
        res.status(200).json({ "Clientes": selectAll })
        return;
    } catch (err) {
        res.status(500).json({ 'error': err });
        logger.error('Erro ao consultar clientes', { erro: err })
        return;
    }

}

async function getCliFiltered(filters = {}, res) {
    try {
        await importCli();
        const filteredCli = await knex(TABELA_CLIENTES).select('*').where(filters)
        logger.info('Clientes filtrados com sucesso!', { "filteredCli": filteredCli })
        res.status(200).json({ "Clientes filtrados": filteredCli })
    } catch (err) {
        res.status(500).json({ 'Erro ao filtrar clientes': err.message });
        logger.error('Erro ao filtrar clientes', { erro: err.message })
    }
}


router.get('/', async (req, res) => {
    if (JSON.stringify(req.body) == "{}") {
        await getCli(req, res);
    } else {
        console.log('tem filtro')
        await getCliFiltered(req.body, res);
    }
});

module.exports = router;