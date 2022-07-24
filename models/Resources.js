// Resources Schema, defining how data/documents are stored in the database
// @Naadir Sulliman, 2021

const mongoose = require("mongoose");
const { model } = require("mongoose/lib");
const Schema = mongoose.Schema;

const ResourcesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
});

var Resources = mongoose.model('Resources', ResourcesSchema);
module.exports = Resources;  
