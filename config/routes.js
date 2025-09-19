// config/routes.js
module.exports = (app) => {
  app.use('/', require('../routes/status'));  // GET /
  app.use('/send', require('../routes/send'));  // POST /send
  app.use('/check', require('../routes/check'));  // POST /check
};
