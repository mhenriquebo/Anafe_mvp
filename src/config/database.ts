import knex from 'knex';
import knexConfig from './knexfile';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment as keyof typeof knexConfig];

console.log('config:', config);

const db = knex(config);

export default db;
