const express = require('express');
const router = express.Router();
const { getCli, getCliFiltered, postClients, putClients, deleteClients } = require('./ClientService')

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