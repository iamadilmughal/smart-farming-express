var express = require("express");
require("dotenv").config();
var cloudinary = require("cloudinary");
require("../config/cloudinaryConfig");
const upload = require("../config/multer");
var router = express.Router();
var md5 = require("md5");
var Admin = require("../models/Admin");

var setpermission = function (req, res, next) {
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};

router.get("/", setpermission, function (req, res, next) {
  Admin.find()
    .sort("adminId")
    .exec(function (error, result) {
      if (error) {
        return error;
      }
      res.json(result);
    });
});

router.post("/", upload.single("profileImage"), setpermission, async function (
  req,
  res,
  next
) {
  var a = new Admin();

  a.name = req.body.name;
  a.email = req.body.email;
  a.dob = req.body.dob;
  a.username = req.body.username;
  a.password = md5(req.body.password);
  a.address = req.body.address;

  if (req.file) {
    console.log("File Incoming");
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    console.log(result);
    if (result) {
      a.picturePath = result.url;
    }
  }

  a.save(function (error, results) {
    if (error) {
      console.log(error);
      return res.status(500).json(error);
    }
    res.json({
      status: 1,
      message: "Admin Added Successfully",
      object: results,
    });
  });
});

router.put(
  "/edit",
  upload.single("profileImage"),
  setpermission,
  async function (req, res, next) {
    var objForUpdate = {};

    if (req.body.name) objForUpdate.name = req.body.name;
    if (req.body.email) objForUpdate.email = req.body.email;
    if (req.body.dob) objForUpdate.dob = req.body.dob;
    if (req.body.password) objForUpdate.password = md5(req.body.password);
    if (req.file) objForUpdate.profileImage = req.file.originalname;
    if (req.body.address) objForUpdate.address = req.body.address;

    if (req.file) {
      console.log("File Incoming");
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      console.log(result);
      if (result) {
        objForUpdate.picturePath = result.url;
      }
    }
    Admin.findOneAndUpdate(
      {
        username: req.body.username,
      },
      objForUpdate,
      function (error, results) {
        if (error) {
          return next(error);
        }
        res.json({
          status: 1,
          message: "Admin Updated Successfully",
          object: results,
        });
      }
    );
  }
);

router.delete("/:username", setpermission, function (req, res, next) {
  var username = req.params.username;
  Admin.deleteOne(
    {
      username: username,
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      res.json({
        status: 1,
        message: "Admin Deleted Successfully",
      });
    }
  );
});

router.get("/view/:name", setpermission, function (req, res, next) {
  var name = req.params.name;
  Admin.findOne({
    username: name,
  })
    .populate("Admin")
    .exec(function (error, results) {
      if (error) {
        return res.status(500).json(error);
      }
      if (!results) {
        res.status(404).json({
          status: 0,
          message: "No Results Found",
        });
      } else {
        res.json(results);
      }
    });
});

router.post("/login", setpermission, function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  // console.log(password);

  console.log("Üsername: " + username + ", Password: " + password);

  Admin.findOne({
    $or: [
      {
        username: username,
      },
      {
        email: username,
      }
    ],
  })
    .populate("Admin")
    .exec(function (error, results) {
      if (error) {
        return next(error);
      }
      if (!results) {
        res.status(404).json({
          status: 0,
          message: "Username Not Found",
        });
      } else {
        // res.json(results);
        if (password === results.password) {
          res.json({
            status: 1,
            message: "Login Successful",
          });
        } else {
          res.status(401).json({
            status: 0,
            message: "Incorrect Password",
          });
        }
      }
    });
});

module.exports = router;
