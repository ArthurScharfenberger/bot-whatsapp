const {getSheetSchema, TABELA_CLIENTES, TABELA_LOGS} = require('../../config/sheetsMeta')
const {getClientes,selectUsersFiltered} = require('../../services/googleSheets');
const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

async function getCli(req,res){
    if (JSON.stringify(req.body) != "{}"){
        const filteredCli = await selectUsersFiltered(req.body)
        console.log(filteredCli)
        res.status(200).json({filteredCli})
        return;
    }
    try{
        const allCli = await getClientes();
        res.status(200).json({clientes:allCli})
    }catch(err){
        logger.error("Erro ao buscar clientes",{erro:err.message})
    }
}

router.get('/',getCli);



module.exports = router;