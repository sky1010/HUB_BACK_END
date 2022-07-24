const Files = require('../models/fileModel');
const express = require('express');
const Client = require('../models/clientModel');
const router = express.Router();
var fs = require('fs');

router.get('/getResources', async (req, res) => {
    try {
        Files.belongsTo(Client, {foreignKey: 'client'})
        const files = await Files.findAll({include: Client});
        res.json(files);
    }
    catch (err) {
        res.json({msg: err.message});

    }
})

router.get('/getResources/:id/:cat', async (req, res) => {
    try {
        let id = req.params.id;
        let cat = req.params.cat;
        Files.belongsTo(Client, {foreignKey: 'client'})
        const files = await Files.findAll({where: {client: id, category:cat},
        include: Client});
        res.json(files);
    }
    catch (err) {
        res.json({msg: err.message});

    }
})

const getFileLocation = (id) => {
    
}

//
// @DESC Retrieves file location to delete from server then in database.
router.get('/deleteResource/:id', async(req, res) => {
    try {
        Files.belongsTo(Client, {foreignKey: 'client'})
        let id = req.params.id;
        const location = await Files.findOne({where: {id: id}, attributes: ['file_location']});
        const name = await Files.findOne({where: {id:id}, attributes:['file_name']});
        const ResourceCategory = await Files.findOne({where: {id:id}, attributes:['category']});
        const getClient = await Files.findOne({where: {id:id}, include: Client, attributes:['client']})
        const clientName = getClient.Client.name;
        const fileData = name.file_name;
        const fileDataCategory = ResourceCategory.category;
        console.log(fileData, fileDataCategory, clientName);
        var mapLocation = process.cwd() + "/fileMap/fileMap_"+ fileDataCategory + "_" + clientName + ".json"; 
        console.log(mapLocation)
        if(location) {
            
            var filename = process.cwd() + "/" + location.file_location;
            //res.json(filename);
            if(fs.existsSync(mapLocation)) {
                fs.readFile(mapLocation, function (err, data) {
                    var json = [];
                    json = JSON.parse(data);
                    const childrenIds = json["fileMap"]["1"]["childrenIds"]
                    const iDtoDelete = childrenIds.indexOf(fileData);
                    childrenIds.splice(iDtoDelete,1);
                    console.log(childrenIds)
                    json["fileMap"]["1"]["childrenIds"] = childrenIds;
                    delete json.fileMap[fileData];
                    console.log(json)
                    console.log(json["fileMap"]["1"])
                    fs.writeFileSync(mapLocation, JSON.stringify(json))
                })
                fs.unlink(filename, function (err) {
                    if (err) {throw err};
                    // if no error, file has been deleted successfully
                        Files.destroy({ where: {id: id}})
                        res.json('File deleted!');
                });
            }
            
        }
        else {
            res.json("File does not exist!")
        }
    } catch (error) {
        res.json({message: error.message})
    }
} )


module.exports = router;
