const { TABELA_CLIENTES } = require('../../config/sheetsMeta')
const { getClientes } = require('../../services/googleSheets');
const express = require('express');
const knex = require('../../database/connection')
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

async function getCliFiltered(data = {}, res) {
    try {
        await importCli();
        const filteredCli = await knex(TABELA_CLIENTES).select('*').where(data)
        logger.info('Clientes filtrados com sucesso!', { "filteredCli": filteredCli })
        res.status(200).json({ "Clientes filtrados": filteredCli })
    } catch (err) {
        res.status(500).json({ 'Erro ao filtrar clientes': err.message });
        logger.error('Erro ao filtrar clientes', { erro: err.message })
    }
}

async function postClients(data = {}, res) {
    try {
        const insertedCli = await knex(TABELA_CLIENTES).insert(data);
        logger.info('Cliente inserido com sucesso!',{"Clinte":insetIntoClients});
        res.status(201).json({'Cliente inserido no banco com sucesso':insertedCli});
    } 
    catch (err) {
        res.status(500).json({ 'Erro ao inserir cliente': err.message });
        logger.error('Erro ao inserir cliente', { erro: err.message });
    }
}

async function putClients(data = {}, res) {
    try {
        const insertedCli = await knex(TABELA_CLIENTES).where({id:data.id}).update(data);
        logger.info('Cliente atualizado com sucesso!',{"Clinte":insetIntoClients});
        res.status(201).json({'Cliente atualizado no banco com sucesso':insertedCli});
    } 
    catch (err) {
        res.status(500).json({ 'Erro ao atualizar cliente': err.message });
        logger.error('Erro ao atualizar cliente', { erro: err.message });
    }
}

async function deleteClients(data = {}, res) {

    try {
        const insertedCli = await knex(TABELA_CLIENTES).where({id:data.id}).del();
        logger.info('Cliente deletado com sucesso!',{"Clinte":insetIntoClients});
        res.status(201).json({'Cliente deletado no banco com sucesso':insertedCli});
    }
     catch (err) {
        res.status(500).json({ 'Erro ao deletar cliente': err.message });
        logger.error('Erro ao deletar cliente', { erro: err.message })
    }
}

module.exports = { getCli, getCliFiltered, postClients, putClients, deleteClients }