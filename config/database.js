const { Sequelize } = require("sequelize");

const db = new Sequelize("HUB_DB", "muzammil", "password", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = db;

//'512!Naadir' pw
//3lem3nt21
