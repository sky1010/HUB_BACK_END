const { Sequelize } = require("sequelize");
const mySQL = require("../config/database");

const { DataTypes } = Sequelize;

const Client = mySQL.define(
  "Client",
  {
    name: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);
(async () => {
  await Client.sync({ alter: true });
})();
module.exports = Client;
