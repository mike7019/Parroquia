require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'parroquia_user',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'parroquia_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USER || 'parroquia_user',
    password: process.env.DB_PASSWORD || 'admin',
    database: (process.env.DB_NAME || 'parroquia_db') + '_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER || 'parroquia_user',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'parroquia_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
