const { Sequelize } = require("sequelize");
const mySQL = require("../config/database");

const { DataTypes } = Sequelize;

const Options = mySQL.define(
  "Options",
  {
    code: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
    },
    user: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);
(async () => {
  await Options.sync({ alter: true });
})();
module.exports = Options;
