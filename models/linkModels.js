const { Sequelize } = require("sequelize");
const mySQL = require("../config/database");

const { DataTypes } = Sequelize;

const Links = mySQL.define(
  "Links",
  {
    url: {
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
  await Links.sync({ alter: true });
})();
module.exports = Links;
