const sequelize = require('../../config/sequelize');
const User = require('./User');

// Import models from the main models directory
const db = require('../../models');

// Re-export everything from the main models
module.exports = {
  sequelize,
  User,
  ...db
};
