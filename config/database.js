const { Sequelize } = require("sequelize");

const db = new Sequelize("postgres://postgres:password@127.0.0.1:5432/HUB_DB");

module.exports = db;
