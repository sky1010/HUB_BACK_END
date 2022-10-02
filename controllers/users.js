const User = require("../models/userModel");
const Client = require("../models/clientModel");
const Options = require("../models/optionsModel");
const Links = require("../models/linkModels");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const fileUpload = require("express-fileupload");
const { Op } = require("sequelize");
const app = express();
app.use(fileUpload());

router.post("/registerUser", async (req, res) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    client: req.body.client,
    password: req.body.password,
    userName: req.body.userName,
  };
  const prevUser = await User.findOne({
    where: {
      userName: req.body.userName,
    },
  });
  if (prevUser) {
    return res.status(409).json({ error: "userName already exsist" });
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      console.log(newUser);
      User.create(newUser)
        .then((user) => res.json(user))
        .catch((err) => {
          console.log(err);
          res.json({ message: "Email already exists" });
        });
    });
  });
});

router.post("/loginUser", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password)
      return res.status(400).json({ msg: "Please fill all fields to login" });

    const user = await User.findOne({
      where: {
        [Op.or]: [
          {
            email: emailOrUsername.trim(),
          },
          {
            userName: emailOrUsername.trim(),
          },
        ],
      },
    });

    if (!user)
      return res
        .status(400)
        .json({ msg: "No account registered with this email. " });

    //console.log(user.dataValues)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign({ id: user.id }, keys.passport.secret);
    res.json({
      token,
      user: user,
      message: "User logged in!",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/getUser/:id", async (req, res) => {
  try {
    let id = req.params.id;
    User.belongsTo(Client, { foreignKey: "client" });
    const user = await User.findOne({ where: { id: id }, include: Client });
    res.json(user);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/getUsers", async (req, res) => {
  try {
    User.belongsTo(Client, { foreignKey: "client" });
    const users = await User.findAll({ include: Client });
    res.json(users);
  } catch (err) {
    res.json({ message: err.message });
  }
});
// Get Users from Client's iD
router.get("/getUsersName/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const users = await User.findAll({
      where: {
        client: id,
      },
    });
    res.json(users);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//GET All options from user ID
router.get("/getUserOpts/:id", async (req, res) => {
  try {
    let id = req.params.id;
    Options.belongsTo(User, { foreignKey: "user" });
    const user = await Options.findAll({ where: { user: id }, include: User });
    res.json(user);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//GET options by category from user ID
router.get("/getUserOpts/:id/:category", async (req, res) => {
  try {
    let id = req.params.id;
    let cat = req.params.category;
    Options.belongsTo(User, { foreignKey: "user" });
    const user = await Options.findOne({
      where: { user: id, category: cat },
      include: User,
    });
    res.json(user);
  } catch (err) {
    res.json({ message: err.message });
  }
});

// @ROUTE GET Options iD from User iD & Category
// @ACCESS Private
router.get("/getUserOptsbycat/:id/:category", async (req, res) => {
  try {
    let id = req.params.id;
    let cat = req.params.category;
    Options.belongsTo(User, { foreignKey: "user" });
    const user = await Options.findOne({
      where: { user: id, category: cat },
      include: User,
      attributes: ["id", "category"],
    });
    res.json(user);
  } catch (err) {
    res.json({ message: err.message });
  }
});
//@ROUTE POST api/users/newOpts/:id
router.post("/newOpts/:id/:category", async (req, res) => {
  try {
    let user = req.params.id;
    let cat = req.params.category;
    let code = req.body.code;
    const newOpt = {
      user: user,
      category: cat,
      code: code,
    };
    await Options.create(newOpt)
      .then((option) => res.json(option))
      .catch((err) => {
        res.json({ message: err });
      });
  } catch {}
});
//@ROUTE PUT api/users/userOpts/:id/:user
//@DESC Updates User Option's code from User's iD and Option's iD
//@ACCESS Private
router.put("/userOpts/:id/:user", async (req, res) => {
  try {
    console.log(req.body);
    let id = req.params.id;
    let user = req.params.user;
    console.log(id);
    console.log(user);
    await Options.update(req.body, {
      where: {
        id: id,
        user: user,
      },
    });
    res.json({ msg: "Options Updated!" });
  } catch (error) {
    res.json({ msg: error.msg });
    console.log({ msg: error.message });
  }
});

router.put("/userData/:id", async (req, res) => {
  try {
    let id = req.params.id;
    console.log(req.body);
    if (req.body.password) {
      const newData = {
        name: req.body.name,
        email: req.body.email,
        client: req.body.client,
        password: req.body.password,
      };
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newData.password, salt, (err, hash) => {
          if (err) {
            throw err;
          }
          newData.password = hash;
          console.log(newData);
          User.update(newData, { where: { id: id } })
            .then((user) => res.json(user))
            .catch((err) => {
              console.log(err);
              res.json({ message: "Failed!" });
            });
        });
      });
    }

    await User.update(req.body, {
      where: {
        id: id,
      },
    });
    res.json("Updated!");
  } catch (error) {
    res.json({ msg: error.message });
  }
});

router.post("/addLink/:id/:cat", async (req, res) => {
  try {
    let id = req.params.id;
    let cat = req.params.cat;
    const Link = {
      url: req.body.url,
      category: cat,
      user: id,
    };
    Links.create(Link)
      .then((link) => res.json(link))
      .catch((err) => {
        res.json({ message: err });
      });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.put("/editlinks/:id/:cat", async (req, res) => {
  try {
    let id = req.params.id;
    let cat = req.params.cat;
    await Links.update(req.body, { where: { id: id, category: cat } });
    res.json({ msg: "Links Updated!" });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

router.get("/userLinks/:id/:cat", async (req, res) => {
  try {
    let id = req.params.id;
    let cat = req.params.cat;
    Links.belongsTo(User, { foreignKey: "user" });
    const links = await Links.findOne({
      where: { user: id, category: cat },
      include: User,
    });
    res.json(links);
  } catch (error) {
    res.json({ Message: error.message });
  }
});

router.get("/usersLinks/:id/:cat", async (req, res) => {
  try {
    let id = req.params.id;
    let cat = req.params.cat;
    Links.belongsTo(User, { foreignKey: "user" });
    const links = await Links.findOne({
      where: { user: id, category: cat },
      include: User,
      attributes: ["url", "category"],
    });
    res.json(links);
  } catch (error) {
    res.json({ Message: error.message });
  }
});

module.exports = router;
