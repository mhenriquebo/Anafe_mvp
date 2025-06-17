import dotenv from 'dotenv';
import { Knex } from 'knex';
dotenv.config();

console.log('config:', process.env);

export default {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'senado_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '12345678',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: '../database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: '../database/seeds',
    },
  },
  staging: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: '../database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: '../database/seeds',
    },
  },
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: '../database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: '../database/seeds',
    },
  },
} as { [key: string]: Knex.Config };
