const Client = require("../models/clientModel");
const express = require("express");
const router = express.Router();

router.post("/createClient", (req, res) => {
  console.log(req.body);
  Client.create(req.body);
  res.json({ message: "Client Created" });
});

router.get("/getClients", async (req, res) => {
  try {
    const clients = await Client.findAll({ attributes: ["id", "name"] });
    res.json(clients);
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router;
