const { Sequelize } = require("sequelize");
const mySQL = require("../config/database");

const { DataTypes } = Sequelize;

const User = mySQL.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    client: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);
(async () => {
  await User.sync({ alter: true });
})();
module.exports = User;
