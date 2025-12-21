const { getSheetSchema, TABELA_CLIENTES, TABELA_LOGS } = require('../../config/sheetsMeta')
const { getClientes } = require('../../services/googleSheets');
const express = require('express');
const knex = require('../../database/connection')
const router = express.Router();
const logger = require('../../utils/logger');
const { insetIntoClients, truncateTable } = require('../../services/dbServices')
const { getCli, getCliFiltered, postClients, putClients, deleteClients } = require('../clientRoutes/ClientService')


router.get('/', async (req, res) => {
    if (JSON.stringify(req.body) == "{}") {
        await getCli(req, res);
    } else {
        console.log('tem filtro')
        await getCliFiltered(req.body, res);
    }
});

router.post('/', async (req,res) =>{
    postClients(req.body, res);
});

router.put('/', async (req,res) =>{
    putClients(req.body,res);
});

router.delete('/', async (req,res) =>{
    deleteClients(req.body,res);
});
module.exports = router;