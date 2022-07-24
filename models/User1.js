// User Schema, defining user's information
// @Naadir Sulliman, 2021

const mongoose = require("mongoose");
const { model } = require("mongoose/lib");
const Schema = mongoose.Schema;

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
        type: String,
        required: false,
        img:
        {
            data: Buffer,
            contentType: String
        }
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
    report: {
        type: String,
        required: false
    },
    cafm: {
        type: String,
        required: false
    }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;  
