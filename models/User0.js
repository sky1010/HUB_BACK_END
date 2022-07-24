// User Schema, defining user's information
// @Naadir Sulliman, 2021

const mongoose = require("mongoose");
const { model } = require("mongoose/lib");
const Schema = mongoose.Schema;
const Client = require("../models/Client");

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    },
    password: {
        type: String,
        required: true    
    },
    role: {
        type: String,
        required: true,
        enum: ["user","admin","developer"]
    },
    reportlink: String,
    cafmlink: String,
    ssrslink: String,
    iotlink: String,
    resourceOpts: String,
    hubOpts: String,
    lang: String,
});

var User = mongoose.model('User', UserSchema);
module.exports = User;  
