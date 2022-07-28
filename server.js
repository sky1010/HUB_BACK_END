const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const fs = require("fs");
require("dotenv").config();
const applyPassportStrat = require("./config/passport");
const fileUpload = require("express-fileupload");
const mySQL = require("./config/database");
const clients = require("./controllers/clients");
const sqlusers = require("./controllers/users");
const file = require("./controllers/files");
const userUploads = require("./controllers/userFiles");
const Files = require("./models/fileModel");
const UserFiles = require("./models/userFileModel");
const Translations = require("./controllers/translations");

try {
  mySQL.authenticate();
  console.log("database successfully connected");
} catch (error) {
  console.error("Connection error:", error);
}
const app = express();
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});
app.use("/", express.static(__dirname + "/public"));
app.use("/Resources", express.static(__dirname + "/Resources"));
app.use("/UserUploads", express.static(__dirname + "/UserUploads"));
app.use("/fileMap", express.static(__dirname + "/fileMap"));
app.use(
  "/en",
  express.static(__dirname + "/translations/en/translations.json")
);
app.use(
  "/fr",
  express.static(__dirname + "/translations/fr/translations.json")
);
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
applyPassportStrat(passport);
// Setting up the back-end default route ("/api/???")
app.use("/api/clients/", clients);
app.use("/api/users/", sqlusers);
app.use("/api/files/", file);
app.use("/api/uploads/", userUploads);
app.use("/api/translations/", Translations);
app.use(fileUpload());

app.get("/ENGjson", async (req, res) => {
  try {
    const data = fs.readFileSync(
      __dirname + "/translations/en/translations.json"
    );
    const buff = new Buffer(data);
    let base64 = Buffer.from(buff, "base64").toString();
    //buff.toString('base64')
    //const jsonF = Buffer.from(base64, 'base64').toString()
    const jsonF = JSON.parse(base64);

    res.json(jsonF);
  } catch (error) {
    res.json({ message: error.message });
  }
});

app.post("/translation/update/english", async (req, res) => {
  const fileLocation = "/translations/en/translations.json";
  const pathToFile = __dirname + fileLocation;
  try {
    if (fs.existsSync(`${pathToFile}`)) {
      var newTranslations = req.body;
      //console.log(newTranslations);
      var json = [];
      fs.readFile(`${pathToFile}`, function (err, data) {
        json = JSON.parse(data);
        delete json;
        fs.writeFileSync(
          `${pathToFile}`,
          JSON.stringify(newTranslations),
          "utf-8"
        );
      });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

app.post("/translation/update/french", async (req, res) => {
  const fileLocation = "/translations/fr/translations.json";
  const pathToFile = __dirname + fileLocation;
  try {
    if (fs.existsSync(`${pathToFile}`)) {
      var newTranslations = req.body;
      //console.log(newTranslations);
      var json = [];
      fs.readFile(`${pathToFile}`, function (err, data) {
        json = JSON.parse(data);
        delete json;
        fs.writeFileSync(
          `${pathToFile}`,
          JSON.stringify(newTranslations),
          "utf-8"
        );
      });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

app.post("/userUpload", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded!",
      });
    } else {
      const newpath = __dirname + "/UserUploads/";
      const mappath = __dirname + "/fileMap/";
      let file = req.files.file;
      let fileName = req.files.file.name;
      const location = "UserUploads/" + fileName;
      const mapLocation = "fileMap/" + fileName;
      console.log(req.body.clientName);
      file.mv(`${newpath}${fileName}`, (err) => {
        if (err) {
          res.status(500).send({ msg: "Failed!", code: 500 });
        }
        if (
          fs.existsSync(
            `${mappath}` +
              "filemap_" +
              `${req.body.category}` +
              "_" +
              `${req.body.clientName}` +
              ".json"
          )
        ) {
          let newData = {
            id: fileName,
            name: fileName,
            location: location,
            parentId: "1",
          };
          fs.readFile(
            `${mappath}` +
              "filemap_" +
              `${req.body.category}` +
              "_" +
              `${req.body.clientName}` +
              ".json",
            function (err, data) {
              var json = [];
              json = JSON.parse(data);
              json["fileMap"][fileName] = newData;
              const newChildrenIds = json["fileMap"]["1"]["childrenIds"];
              newChildrenIds.push(fileName);
              json["fileMap"]["1"]["childrenIds"] = newChildrenIds;
              console.log(json);
              console.log(json["fileMap"]["1"]);
              fs.writeFileSync(
                `${mappath}` +
                  "filemap_" +
                  `${req.body.category}` +
                  "_" +
                  `${req.body.clientName}` +
                  ".json",
                JSON.stringify(json)
              );
            }
          );
          const newFile = {
            file_name: fileName,
            file_location: location,
            category: req.body.category,
            client: req.body.client,
            user: req.body.user,
          };
          UserFiles.create(newFile)
            .then(
              res
                .status(200)
                .send({ msg: "Success!", status: true, data: file, code: 200 })
            )
            .catch((err) => {
              res.json({ msg: "Failed to Upload!", error: err });
            });
        } else {
          let fileMap = {
            rootFolderId: "1",
            fileMap: {
              1: {
                id: "1",
                name: req.body.category,
                isDir: true,
                childrenIds: [fileName],
              },
              [fileName]: {
                id: fileName,
                name: fileName,
                location: location,
                parentId: "1",
              },
            },
          };
          var fileMapJSON = JSON.stringify(fileMap);
          fs.writeFileSync(
            `${mappath}` +
              "filemap_" +
              `${req.body.category}` +
              "_" +
              `${req.body.clientName}` +
              ".json",
            fileMapJSON,
            "utf8"
          );

          const newFile = {
            file_name: fileName,
            file_location: location,
            category: req.body.category,
            client: req.body.client,
            user: req.body.user,
          };
          UserFiles.create(newFile)
            .then(
              res
                .status(200)
                .send({ msg: "Success!", status: true, data: file, code: 200 })
            )
            .catch((err) => {
              res.json({ msg: "Failed to Upload!", error: err });
            });
        }
      });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

app.post("/uploadResource", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded!",
      });
    } else {
      const newpath = __dirname + "/Resources/";
      const mappath = __dirname + "/fileMap/";

      let file = req.files.file;
      let fileName = req.files.file.name;
      console.log(file);
      console.log(req.body);
      const mapLocation = "fileMap/" + fileName;
      const location = "Resources/" + fileName;
      console.log(location);
      file.mv(`${newpath}${fileName}`, (err) => {
        if (err) {
          res.status(500).send({ msg: "Failed!", code: 500 });
        }

        if (
          fs.existsSync(
            `${mappath}` +
              "filemap_" +
              `${req.body.category}` +
              "_" +
              `${req.body.clientName}` +
              ".json"
          )
        ) {
          let newData = {
            id: fileName,
            name: fileName,
            location: location,
            parentId: "1",
          };
          fs.readFile(
            `${mappath}` +
              "filemap_" +
              `${req.body.category}` +
              "_" +
              `${req.body.clientName}` +
              ".json",
            function (err, data) {
              var json = [];
              json = JSON.parse(data);
              json["fileMap"][fileName] = newData;
              const newChildrenIds = json["fileMap"]["1"]["childrenIds"];
              newChildrenIds.push(fileName);
              json["fileMap"]["1"]["childrenIds"] = newChildrenIds;
              console.log(json);
              console.log(json["fileMap"]["1"]);
              fs.writeFileSync(
                `${mappath}` +
                  "filemap_" +
                  `${req.body.category}` +
                  "_" +
                  `${req.body.clientName}` +
                  ".json",
                JSON.stringify(json)
              );
            }
          );
          const newFile = {
            file_name: fileName,
            file_location: location,
            category: req.body.category,
            client: req.body.clientId,
          };
          Files.create(newFile)
            .then(
              res
                .status(200)
                .send({ msg: "Success!", status: true, data: file, code: 200 })
            )
            .catch((err) => {
              console.log(err);
              res.json({ message: "Fail to upload" });
            });
          console.log(res);
        } else {
          let fileMap = {
            rootFolderId: "1",
            fileMap: {
              1: {
                id: "1",
                name: req.body.category,
                isDir: true,
                childrenIds: [fileName],
              },
              [fileName]: {
                id: fileName,
                name: fileName,
                location: location,
                parentId: "1",
              },
            },
          };
          var fileMapJSON = JSON.stringify(fileMap);
          fs.writeFileSync(
            `${mappath}` +
              "filemap_" +
              `${req.body.category}` +
              "_" +
              `${req.body.clientName}` +
              ".json",
            fileMapJSON,
            "utf8"
          );

          const newFile = {
            file_name: fileName,
            file_location: location,
            category: req.body.category,
            client: req.body.clientId,
          };
          Files.create(newFile)
            .then(
              res
                .status(200)
                .send({ msg: "Success!", status: true, data: file, code: 200 })
            )
            .catch((err) => {
              console.log(err);
              res.json({ message: "Fail to upload" });
            });
        }
      });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

app.post("/filemap", async (req, res) => {
  try {
    const mapPath = __dirname + "/fileMap/";
    const fileMap = req.body.newFileMap;
    const category = req.body.category;
    const client = req.body.client;
    if (
      fs.existsSync(
        `${mapPath}` + "filemap_" + `${category}` + "_" + `${client}` + ".json"
      )
    ) {
      fs.readFile(
        `${mapPath}` + "filemap_" + `${category}` + "_" + `${client}` + ".json",
        function (err, data) {
          var json = [];
          json = JSON.parse(data);
          delete json.fileMap;
          json["fileMap"] = fileMap;
          console.log(json);
          fs.writeFileSync(
            `${mapPath}` +
              "filemap_" +
              `${category}` +
              "_" +
              `${client}` +
              ".json",
            JSON.stringify(json)
          );
        }
      );
    } else {
      let fileData = {
        rootFolderId: "1",
        fileMap: fileMap,
      };
      var fileMapJSON = JSON.stringify(fileData);
      fs.writeFileSync(
        `${mapPath}` + "filemap_" + `${category}` + "_" + `${client}` + ".json",
        fileMapJSON,
        "utf-8"
      );
    }
  } catch (err) {
    console.log("Error:", err.message);
  }
});

const port = process.env.PORT || 3512;

app.listen(port, () => console.log(`Server Running on port ${port} ! `));
