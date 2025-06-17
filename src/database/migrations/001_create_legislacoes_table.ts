import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('legislacoes', table => {
    table.increments('id').primary();
    table.string('codigo').notNullable().unique(); // campo 'norma' da API
    table.string('tipo').notNullable();
    table.string('numero').notNullable();
    table.string('norm_nome').notNullable(); // normaNome da API
    table.text('descricao');
    table.text('ementa');
    table.date('data_assinatura');
    table.integer('ano_assinatura');
    table.string('apelido');
    table.timestamps(true, true);

    table.index(['codigo']);
    table.index(['tipo']);
    table.index(['numero']);
    table.index(['data_assinatura']);
    table.index(['ano_assinatura']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('legislacoes');
}
