require('dotenv').config();

// Debug: Verificar variables de entorno
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);

module.exports = {
  development: {
    username: process.env.DB_USER || 'parroquia_user',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'parroquia_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    dialectOptions: {
      charset: 'utf8'
    },
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
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    dialectOptions: {
      charset: 'utf8'
    },
    logging: false
  },
  production: {
    username: process.env.DB_USER || 'parroquia_user',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'parroquia_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    dialectOptions: {
      charset: 'utf8'
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
