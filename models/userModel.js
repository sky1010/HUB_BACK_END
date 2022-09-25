const { Sequelize } = require("sequelize");
const mySQL = require("../config/database");
const bcrypt = require("bcryptjs");

const { DataTypes } = Sequelize;

const User = mySQL.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
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
const newUser = {
  name: "Greig Jones",
  email: "greig@forumconcepts.fr",
  client: 6,
  password: "hubsqlBeta",
};
(() => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, async (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      console.log(newUser);
      const prev = await User.findOne({
        where: {
          email: newUser.email,
        },
      });
      if (!prev) {
        User.create(newUser)
          .then()
          .catch((err) => {
            console.log(err);
          });
      }
    });
  });
})();
module.exports = User;
