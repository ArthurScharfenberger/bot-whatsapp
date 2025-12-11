const {getSheetSchema, TABELA_CLIENTES, TABELA_LOGS} = require('../../config/sheetsMeta')
const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

router.get('/', async (req, res) => {
  try {
    const clientesSchema = await getSheetSchema(TABELA_CLIENTES);
    const logsSchema = await getSheetSchema(TABELA_LOGS);

    res.json({
      status: "ok",
      googleSheets: "connected",
      clientes: {
        colunas: clientesSchema.colunas,
        totalColunas: clientesSchema.total,
        range: clientesSchema.range
      },
      logs: {
        colunas: logsSchema.colunas,
        totalColunas: logsSchema.total,
        range: logsSchema.range
      }
    });

  } catch (err) {
    logger.error("Erro no /health", { erro: err.message });

    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

module.exports = router;