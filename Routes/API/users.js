// Load Dependencies
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const fileUpload = require("express-fileupload");
const app = express();
app.use(fileUpload());

// Load Input Validation/Verification
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Loading Model
const User = require("../../models/User0");
const Resources = require("../../models/Resources");
const UploadSchema = require("../../models/uploadedDoc");
const Client = require("../../models/Client");

const { passport } = require("../../config/keys");
const { isNullOrUndefined } = require("mongoose/lib/utils");

// @route POST admin/register
// @desc Register new user
// @access Admin only
router.post("/register", (req,res) => {
    
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email}).then(user => {
        if(user) {
            return res.status(400).json({email:"Email already exists"});
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                client: req.body.client,
                password: req.body.password,
                role: req.body.role,
                reportlink: req.body.reportlink,
                cafmlink: req.body.cafmlink,
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    
                  if (err) throw err;
                    newUser.password = hash;
                    newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                });
            });
        }
    });

});
// @Route api/users/login
// @desc Authenticate Login and return JWT Token
// @access Public 
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
        return res.status(400)
        .json({ msg: "Please fill all fields to Login!" })

        const user = await User.findOne({ email: email });

        if(!user)
        return res
        .status(400)
        .json({ msg: "No account with this email has been registered. "})

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({msg: "Invalid credentials"});
        
        const token = jwt.sign({ id: user._id }, keys.passport.secret);
        
        res.json({
            token,
            user: user,
        });
        
    } catch (err) {
        res.status(500).json( { error: err.message });
    }
});
// @route GET /login
// @desc Get Logged-in User
// @access Admin only
router.get('/login', (req,res)=> {
  let loggedIn = false;
  if(req.session.user) {
      res.send({loggedIn: true, user: req.session.user});
  }else {
      res.send({loggedIn: false});
  }
} )

// @route POST /newClient
// @desc Register's a new Client
// @access Admin only
router.post("/newClient", (req,res) => {
  console.log(req.body)
  Client.findOne({client: req.body.client}).then(client => {
    const newClient = new Client({
      client: req.body.client,
    });
    newClient.save()
    .then(client => res.json(client))
    .catch(err => console.log(err));
  })
})
// @route GET /client/:id
// @desc Get client by iD
// @access Admin only 
router.get(
  "/client/:id",
  (req, res) => {
    let id = req.params.id;
    Client.findById(id, (err, result) => {
      res.status(200).json({
        data: result,
      });
    });
  }
);
// @route GET /clientlist
// @desc Retrieves all clients from MongoDB Client Collection
// @access Admin only
router.get(
  "/clientList",
  (req, res) => {
   
    Client.find({}, "-__v")
      .exec(function (err, client) {
        if(err){
          console.log(res.status(404).send);
        }
        res.status(200).json({
          data: client,
        });
        
      })
    }
);
// @route GET /clientlist/:id
// @desc Retrieves all clients from MongoDB User Collection and populates the Client Field
// @access Admin only
router.get(
  "/clientList/:id",
  (req, res) => {
    let id= req.params.id;
    User.findById(id).populate('client', "-_id -__v")
      .exec(function (err, client) {
        if(err){
          console.log(res.status(404).send);
        }
        res.status(200).json({
          data: client,
        });
        
      })
    }
);
// @route GET /clientlist/:id
// @desc Retrieves all clients from MongoDB User Collection and populates the Client Field
// @access Admin only
router.get(
  "/client/user/:id",
  (req, res) => {
    let id= req.params.id;
    User.find({client:id}, {name:1})
      .exec(function (err, client) {
        if(err){
          console.log(res.status(404).send);
        }
        res.status(200).json({
          data: client,
        });
        
      })
    }
);
// @route GET /userslist
// @desc Retrieves all users from MongoDB Users Collection
// @access Admin only
router.get(
    "/usersList",
    (req, res) => {
      User.find({}, (err, result) => {
        res.status(200).json({
          data: result,
        });
      });
    }
  );

  
  router.get(
    "/usersNameList",
    (req, res) => {
      User.find({}, {name:1}, (err, result) => {
        res.status(200).json({
          data: result,
        });
      });
    }
  );

// @route GET /user/:id
// @desc Get user by iD
// @access Admin only 
router.get(
    "/user/:id",
    (req, res) => {
      let id = req.params.id;
      User.findById(id, (err, result) => {
        res.status(200).json({
          data: result,
        });
      });
    }
  );
// @route GET /user/:id
// @desc Get user by iD
// @access Admin only 
router.get(
  "/client/user",
  (req, res) => {
    let id = req.params.id;
    User.find({}, (err, result) => {
      res.status(200).json({
        data: result,
      });
      console.log(result)
    });
    
  }
);

// @route PUT /updateuser/:id
// @desc update user by id
// @access Admin only 
router.put(
  "/updateuser/:id",
  (req, res, next) => {
    let editedUser = req.body;
    console.log(req.body)
    User.findByIdAndUpdate(req.params.id, editedUser, {
      new: true
    }).then((err, record) => {
      if(err) {
        console.log(err);
        return next(err);
      } else {
        res.send.json(record);
        res.status(200).json("updated!")
      }
    });
    
  }
); 

// @route DEL /deleteuser/:id
// @desc Delete user by iD
// @access Admin Only
router.delete("/deleteuser/:id",
  function(req,res) {
    let id = req.params.id;
      User.findByIdAndDelete(id)
      .then(user => res.status(200).json("User deleted!"))
      .catch(err => res.status(400).json('Error:'+err));
});


router.delete("/deleteResources/:id",
  function(req,res) {
    let id= req.params.id;
      Resources.findByIdAndDelete(id)
      .then(res.status(200).json("Resource Deleted!"))
      .catch(err => res.status(400).json("Error:"+ err));
  });


// Upload Resources (docs only) to MongoDB Resource Collection
router.post('/uploadResources', function(req, res) {
    let data = req.body;
    let file1 = req.body.file;
    console.log(req.body)
    const resource = new Resources({
        name: data.name,
        file: file1,
        category: data.category,
        description: req.body.description,
    })
    resource
                    .save()
                    .then(res.json(resource))
                    .catch(err => console.log(err));
});


// Get Uploaded Resources for each categories 
router.get(
    "/getTemplatesResources",
    (req, res) => {
      Resources.find({category: "Templates"}, (err, result) => {
        
        res.status(200).json({
          data: result,
        });
        
      });
    }
  );
router.get(
    "/getChecklistResources",
    (req, res) => {
      Resources.find({category: "Checklists"}, (err, result) => {
        
        res.status(200).json({
          data: result,
        });
        
      });
    }
  );
router.get(
    "/getWorkflowResources",
    (req, res) => {
      Resources.find({category: "Workflows"}, (err, result) => {
        
        res.status(200).json({
          data: result,
        });
        
      });
    }
  );
router.get(
    "/getContractorResources",
    (req, res) => {
      Resources.find({category: "Contractor"}, (err, result) => {
        
        res.status(200).json({
          data: result,
        });
        
      });
    }
  );
router.get(
    "/getTmResources",
    (req, res) => {
      Resources.find({category: "Training Media"}, (err, result) => {
        
        res.status(200).json({
          data: result,
        });
        
      });
    }
  );
// User's Uploaded Documents to MongoDB UserUpload Collection
router.post('/uploadUser', function(req, res) {
    let data = req.body;
    let file1 = req.body.file;
    const uploaded = new UploadSchema({
        name: data.name,
        file: file1
    })
    uploaded
                    .save()
                    .then(res.json(uploaded))
                    .catch(err => console.log(err));
});
router.get(
    "/getUploaded",
    (req, res) => {
      UploadSchema.find({}, (err, result) => {
        
        res.status(200).json({
          data: result,
        });
        
      });
    }
  );
router.get(
    "/getUploadedRes",
    (req, res) => {
      Resources.find({}, (err, result) => {
        res.status(200).json({
          data: result,
        });
        
      });
    }
  );

  module.exports = router;
