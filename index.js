require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const { PORT } = require('./config/config');
const { errorHandler } = require('./utils/errorHandler');
const {getSheetSchema} = require('./config/sheetsMeta')

const app = express();
app.use(express.json());

// rotas
app.use('/', require('./routes/status'));
app.use('/send', require('./routes/send'));
app.use('/check', require('./routes/check'));
app.use('/whats',require('./routes/whatsConn'))

//debug
app.use('/debug/health',require('./routes/debugRoutes/SheetsHealth'))
app.use('/debug/cli',require('./routes/debugRoutes/clientDebug'));
//app.use('/debug/sch',require('./routes/debugRoutes/scheduleDebug'))

//Client
app.use('/client',require('./routes/clientRoutes/client'))

//Schedule
//app.use('/schedule',require('./routes/scheduleRoutes/schedule'))

// erro global
//app.use(errorHandler);
app.listen(PORT, () => {
  logger.info(`🟢 API rodando em http://localhost:${PORT}`);
})

