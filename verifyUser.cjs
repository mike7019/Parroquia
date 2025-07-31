const { Sequelize } = require('sequelize');
const config = require('./config/config.cjs');

async function verifyUser() {
  const sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    config.development
  );

  try {
    await sequelize.query('UPDATE users SET "emailVerified" = true WHERE email = ?;', {
      replacements: ['testuser@example.com']
    });
    console.log('User email verified successfully');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyUser();
