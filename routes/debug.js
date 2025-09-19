const express = require('express');
const router = express.Router();
const config = require('../config/config');

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    port: config.PORT,
    requireAuth: config.REQUIRE_AUTH,
    defaultIntervalDays: config.DEFAULT_INTERVAL_DAYS,
    session: config.SESSION_NAME
  });
});

module.exports = router;
