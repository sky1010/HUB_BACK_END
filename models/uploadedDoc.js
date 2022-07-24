// User's uploaded files Schema, defining how data/documents are stored in the database
// @Naadir Sulliman, 2021

const mongoose = require("mongoose");
const { model } = require("mongoose/lib");
const Schema = mongoose.Schema;

const UploadSchema = new Schema({
    name: {
        type: String,
        
    },
    uploadedBy: {
        type: String,
        
    },
    file: {
        type: String,
        
    }
});

var uploadModel = mongoose.model('Uploaded', UploadSchema);
module.exports = uploadModel;  