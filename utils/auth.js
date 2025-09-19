const { API_TOKEN, REQUIRE_AUTH } = require('../config/config');

module.exports = (req, res, next) => {
  if (!REQUIRE_AUTH) return next();
  const token = req.headers['authorization'];
  if (!token || String(token).trim() !== String(API_TOKEN).trim()) {
    return res.status(403).json({ error: 'Não autorizado' });
  }
  next();
};
