var express = require("express");
require("dotenv").config();
var cloudinary = require("cloudinary");
require("../config/cloudinaryConfig");
const upload = require("../config/multer");
var router = express.Router();
var md5 = require("md5");
var Farmer = require("../models/Farmer");
var Farm = require("../models/Farm");

var setpermission = function(req, res, next) {
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};

router.get("/", setpermission, function(req, res, next) {
  Farmer.find().exec(function(error, result) {
    if (error) {
      res.status(500).json(error);
    }
    res.json(result);
  });
});

router.post("/", upload.single("profileImage"), setpermission, async function(
  req,
  res,
  next
) {
  var f = new Farmer();

  // f.farmerId = req.body.farmerId;
  f.name = req.body.name;
  f.email = req.body.email;
  f.dob = req.body.dob;
  f.username = req.body.username;
  f.password = md5(req.body.password);
  f.address = req.body.address;
  // f.picturePath = req.file.filename;

  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    console.log(result);
    if (result) {
      f.picturePath = result.url;
      console.log(f.picturePath);
    }
  }
  f.save(function(error, results) {
    if (error) {
      console.log(error)
      return res.status(500).json(error);
    }
    res.json({
      status: 1,
      message: "Farmer Added Successfully",
      object: results
    });
  });
});

router.put("/", upload.single("profileImage"), setpermission, function(
  req,
  res,
  next
) {
  var objForUpdate = {};

  if (req.body.name) objForUpdate.name = req.body.name;
  if (req.body.email) objForUpdate.email = req.body.email;
  if (req.body.dob) objForUpdate.dob = req.body.dob;
  if (req.body.dob) objForUpdate.address = req.body.address;
  if (req.body.password) objForUpdate.password = md5(req.body.password);
  if (req.file) objForUpdate.profileImage = req.file.originalname;

  Farmer.findOneAndUpdate(
    {
      username: req.body.username
    },
    objForUpdate,
    function(error, results) {
      if (error) {
        return next(error);
      }
      if (results !== null) {
        res.json({
          status: 1,
          message: "Farmer Updated Successfully",
          object: results
        });
      } else {
        res.status(404).json({
          status: 0,
          message: "Not Found",
          object: results
        });
      }
    }
  );
});

router.delete("/:username", setpermission, function(req, res, next) {
  var username = req.params.username;
  Farmer.deleteOne(
    {
      username: username
    },
    function(error, results) {
      if (error) {
        return next(error);
      }
      if (results.deletedCount > 0) {
        res.json({
          status: 1,
          message: "Farmer Deleted Successfully"
        });
      } else {
        res.status(404).json({
          status: 0,
          message: "Farmer Not Found"
        });
      }
    }
  );
});

router.get("/view/:name", setpermission, function(req, res, next) {
  var name = req.params.name;
  Farmer.findOne({
    username: name
  })
    .populate("Farmer")
    .exec(function(error, results) {
      if (error) {
        return res.status(500).json(error);
      }
      if (!results) {
        res.status(404).json({
          status: 0,
          message: "No Results Found"
        });
      } else {
        res.json({
          status: 1,
          res: results
        });
      }
    });
});

router.post("/login", setpermission, function(req, res, next) {
  var username = req.body.username;
  var password = md5(req.body.password);
  Farmer.findOne({
    username: username
  })
    .populate("Farmer")
    .exec(function(error, results) {
      if (error) {
        return next(error);
      }
      if (!results) {
        res.json({
          status: 0,
          message: "Username Not Found"
        });
      } else {
        if (password === results.password) {
          res.json({
            status: 1,
            message: "Login Successful"
          });
        } else {
          res.json({
            status: 0,
            message: "Incorrect Password"
          });
        }
      }
    });
});

router.get("/farm", setpermission, function(req, res, next) {
  var farmerId = req.body.farmerId;

  Farmer.findOne(
    {
      _id: farmerId
    },
    function(err, results) {
      if (err) {
        res.status(500).json({
          status: 0,
          message: "Some Error Occured"
        });
      } else {
        if (!results) {
          res.status(404).json({
            status: 0,
            message: "No Farm Found"
          });
        } else {
          res.json({
            status: 1,
            farms: results.farms
          });
        }
      }
    }
  );
});

router.post("/farm", setpermission, function(req, res, next) {
  var farm = new Farm({
    plants: req.body.plants,
    longitude: req.body.longitude,
    latitude: req.body.latitude,
    area: req.body.area
  });

  console.log("Farm Created Successfully");

  farmId = "";
  farmCreated = false;

  farm.save(function(error, results) {
    if (error) {
      return res.status(500).json(error);
    }
    console.log("Farm Saved Successfully");
    farmId = results._id;
    console.log("Saved Farm ID" + farmId);

    Farmer.findByIdAndUpdate(
      {
        _id: req.body.farmerId
      },
      {
        $push: {
          farms: farmId
        }
      },
      function(error, result) {
        if (error) {
          res.status(500).json(error);
        } else {
          if (result !== null) {
            res.json({
              status: 1,
              message: "Farm Added Successfully"
            });
          } else {
            res.status(404).json({
              status: 0,
              message: "No Farmer Found with Specified ID"
            });
          }
        }
      }
    );
  });
});

router.get("/:id/farms", setpermission, async function(req, res, next) {
  let farmerId = req.params.id;
  console.log(farmerId);
  Farmer.findById(farmerId).exec(async function(error, result) {
    if (error) {
      res.status(500).json(error);
    }
    if (result == null) {
      res.status(404).json({
        status: 0,
        message: "Farmer not Found with Specified ID"
      });
    }
    farms = [];
    done = false;
    console.log(result.farms);
    let count = 0;
    result.farms.forEach(farmId => {
      Farm.findById(farmId).exec(function(err, farmResult) {
        if (err) {
          res.status(500).json(err);
        }
        farms.push(farmResult);
        console.log(farmResult);
        count += 1;
        if (
          count === result.farms.length ||
          result.farms.length === 0 ||
          result.farms == null ||
          result.farms == undefined
        ) {
          res.json(farms);
        }
      });
    });
    res.json(farms);
  });
});

router.delete("/farms", setpermission, function(req, res, next) {
  var farmId = req.body.farmId;
  var farmerId = req.body.farmerId;
  Farm.deleteOne(
    {
      _id: farmId
    },
    function(error, results) {
      if (error) {
        res.status(500).json(error);
      }
      if (results.deletedCount > 0) {
        console.log("Farm Found and Deleted");
        Farmer.findOne(
          {
            _id: farmerId
          },
          function(err, result) {
            if (err) {
              res.json({
                status: 0,
                message: err
              });
              console.log("Farmer Found");
              let arr = result.farms;
              let index = arr.indexOf(farmId);
              if (index > -1) {
                arr.splice(index, 1);
              }
              result.farms = arr;
              res.json({
                status: 1,
                message: "Farm Deleted Successfully"
              });
            }
          }
        );
      } else {
        res.status(404).json({
          status: 0,
          message: "Farmer Not Found"
        });
      }
    }
  );
});

router.get("/searchByName", setpermission, function(req, res, next) {
  Farmer.find(
    {
      name: {
        $regex: req.body.searchName,
        $options: "i"
      }
    },
    function(error, results) {
      if (error) {
        res.status(500).json(error);
      } else {
        if (result !== null) {
          res.json({
            status: 1,
            results: results
          });
        } else {
          res.status(404).json({
            status: 0,
            message: "No Farmer with Given Name"
          });
        }
      }
    }
  );
});

router.get("/predictDisease", upload.single("imageToPredict"), function(
  req,
  res,
  next
) {
  var request = require("request");
  var fs = require("fs");
  console.log("Request Received at Predict Disease");

  console.log(req.file.originalname);

  request.post(
    {
      url: "http://localhost:8000/predict/",
      formData: { image: fs.createReadStream(req.file.filename), testCheck: 1 }
    },
    function(error, response, body) {
      if (error) {
        console.log("Some Error Occured");
        console.log(error);
        res.status(500).json(error);
      }
      console.log("ABOUT TO SEND DATA BACK");
      res.json(response);
    }
  );
});

module.exports = router;
