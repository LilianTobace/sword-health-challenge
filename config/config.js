require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: true,
    'migrations-path': './app/database/migrations',
    'models-path': './app/database/models',
    'seeders-path': './app/database/seeders',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: true,
    'migrations-path': './app/database/migrations',
    'models-path': './app/database/models',
    'seeders-path': './app/database/seeders',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    'migrations-path': './app/database/migrations',
    'models-path': './app/database/models',
    'seeders-path': './app/database/seeders',
  },
};
