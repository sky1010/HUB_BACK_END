const mongoose = require("mongoose");
const { model } = require("mongoose/lib");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    report: String,
    cafm: String,
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['user','admin']
    },
    links: {
        reportlink: String,
        cafmlink: String,
    },
})

var User = mongoose.model('Member', UserSchema);
model.exports = User;