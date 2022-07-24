// Client Schema, defining Client's information
// @Naadir Sulliman, 2021

const mongoose = require("mongoose");
const { model } = require("mongoose/lib");
const Schema = mongoose.Schema;
const User = require("./User");
const ClientSchema = new Schema({
    client: {
        type: String,
        required: true
    }
});

var Client = mongoose.model('Client', ClientSchema);
module.exports = Client;  
