// require('dotenv').config();
const { Sequelize } = require('sequelize');
// const { DataTypes } = require('sequelize');
// const userModel = require('../models/userModel');
// const taskModel = require('../models/taskModel');

module.exports.sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { dialect: 'mysql', host: process.env.DB_HOST },
);

module.exports.handler = async () => {
  try {
    await module.exports.sequelize.authenticate();
    await module.exports.sequelize.sync();
  } catch (error) {
    throw new Error(error);
  }
};
