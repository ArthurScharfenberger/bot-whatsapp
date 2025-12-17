/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('clients', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('phone').notNullable().unique();
        table.string('email').notNullable().unique();
        table.string('address');
        table.string('CEP');
        table.double('panel_power');
        table.date('last_service');
        table.date('next_service');
        table.boolean('status').notNullable();

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('clients');
};
