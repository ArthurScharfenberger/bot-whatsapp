// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/database.sqlite3'
    },
    migrations: {
      directory: './database/migrations/test/'
    },
    useNullAsDefault: true // ✅ AQUI
  }
  /*production: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    }
  },*/
};


