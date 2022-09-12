const UserFiles = require("../models/userFileModel");
const express = require("express");
const User = require("../models/userModel");
const Client = require("../models/clientModel");
const router = express.Router();
var fs = require("fs");

// @DESC Fetch all user uploads
router.get("/getUserUploads", async (req, res) => {
  try {
    UserFiles.belongsTo(Client, { foreignKey: "client" });
    UserFiles.belongsTo(User, { foreignKey: "user" });
    const files = await UserFiles.findAll({ include: [Client, User] });
    res.json(files);
  } catch (err) {
    res.json({ msg: err.message });
  }
});

// @DESC Fetch user uploads by client iD and category
router.get("/getUserUploads/:id/:cat", async (req, res) => {
  try {
    let id = req.params.id;
    let cat = req.params.cat;
    UserFiles.belongsTo(Client, { foreignKey: "client" });
    UserFiles.belongsTo(User, { foreignKey: "user" });
    const files = await UserFiles.findAll({
      where: { client: id, category: cat },
      include: [Client, User],
    });
    res.json(files);
  } catch (err) {
    res.json({ msg: err.message });
  }
});

// @DESC Retrieves file location to delete from server then in database.
router.get("/deleteUserUpload/:id", async (req, res) => {
  try {
    UserFiles.belongsTo(Client, { foreignKey: "client" });
    let id = req.params.id;
    const location = await UserFiles.findOne({
      where: { id: id },
      attributes: ["file_location"],
    });
    const name = await UserFiles.findOne({
      where: { id: id },
      attributes: ["file_name"],
    });
    const ResourceCategory = await UserFiles.findOne({
      where: { id: id },
      attributes: ["category"],
    });
    const getClient = await UserFiles.findOne({
      where: { id: id },
      include: Client,
      attributes: ["client"],
    });
    const clientName = getClient.Client.name;
    const fileData = name.file_name;
    const fileDataCategory = ResourceCategory.category;
    var mapLocation =
      process.cwd() +
      "/fileMap/fileMap_" +
      fileDataCategory +
      "_" +
      clientName +
      ".json";
    console.log(fileData, fileDataCategory, clientName);
    console.log(mapLocation);
    if (location) {
      var filename = process.cwd() + "/" + location.file_location;
      //res.json(filename);
      var filename = process.cwd() + "/" + location.file_location;
      //res.json(filename);
      if (fs.existsSync(mapLocation)) {
        fs.readFile(mapLocation, function (err, data) {
          var json = [];
          json = JSON.parse(data);
          const childrenIds = json["fileMap"]["1"]["childrenIds"];
          const iDtoDelete = childrenIds.indexOf(fileData);
          childrenIds.splice(iDtoDelete, 1);
          console.log(childrenIds);
          json["fileMap"]["1"]["childrenIds"] = childrenIds;
          delete json.fileMap[fileData];
          console.log(json);
          console.log(json["fileMap"]["1"]);
          fs.writeFileSync(mapLocation, JSON.stringify(json));
        });
        fs.unlink(filename, function (err) {
          if (err) {
            throw err;
          }
          // if no error, file has been deleted successfully
          UserFiles.destroy({ where: { id: id } });
          res.json("File deleted!");
        });
      }
    } else {
      res.json("File does not exist!");
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
