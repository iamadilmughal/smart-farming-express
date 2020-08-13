var express = require("express");
require("dotenv").config();
var cloudinary = require("cloudinary");
require("../config/cloudinaryConfig");
const upload = require("../config/multer");
var router = express.Router();
var md5 = require("md5");

var Expert = require("../models/Expert");

var setpermission = function (req, res, next) {
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};

router.get("/", setpermission, function (req, res, next) {
  Expert.find().exec(function (error, result) {
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
  e = new Expert();

  e.name = req.body.name;
  e.email = req.body.email;
  e.dob = req.body.dob;
  e.username = req.body.username;
  e.password = md5(req.body.password);
  e.address = req.body.address;
  e.rating = req.body.rating;

  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    console.log(result);
    if (result) {
      e.picturePath = result.url;
    }
  }

  e.save(function (error, results) {
    if (error) {
      console.log(error);
      res.json(error);
    } else {
      res.json({
        status: 1,
        message: "Expert Added Successfully",
      });
    }
  });
});

router.put("/uprate", setpermission, function (req, res, next) {
  Expert.findOneAndUpdate(
    {
      username: req.body.username,
    },
    {
      $inc: {
        rating: 1,
      },
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      res.json({
        status: 1,
        message: "Expert Uprated Successfully",
        object: results,
      });
    }
  );
});

router.put("/downrate", setpermission, function (req, res, next) {
  Expert.findOneAndUpdate(
    {
      username: req.body.username,
    },
    {
      $inc: {
        rating: -1,
      },
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      res.json({
        status: 1,
        message: "Expert Downrated Successfully",
        object: results,
      });
    }
  );
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
    if (req.body.rating) objForUpdate.rating = req.body.rating;
    if (req.body.profileImage)
      objForUpdate.profileImage = req.body.profileImage;
    if (req.body.address) objForUpdate.address = req.body.address;

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      console.log(result);
      if (result) {
        objForUpdate.picturePath = result.url;
      }
    }

    console.log(objForUpdate);

    Expert.findOneAndUpdate(
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
          message: "Expert Updated Successfully",
          object: results,
        });
      }
    );
  }
);

router.delete("/:username", setpermission, function (req, res, next) {
  var username = req.params.username;
  Expert.deleteOne(
    {
      username: username,
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      if (results.deletedCount > 0) {
        res.json({
          status: 1,
          message: "Expert Deleted Successfully",
        });
      } else {
        res.status(404).json({
          status: 0,
          message: "Expert Not Found",
        });
      }
    }
  );
});

router.get("/view/:name", setpermission, function (req, res, next) {
  var name = req.params.name;
  Expert.findOne({
    username: name,
  })
    .populate("Expert")
    .exec(function (error, results) {
      if (error) {
        return next(error);
      }

      if (!results) {
        res.status(404).send("No Record Found");
      } else {
        res.json(results);
      }
    });
});

router.post("/login", setpermission, function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  console.log("Üsername: " + username + ", Password: " + password);

  Expert.findOne({
    $or: [
      {
        username: username,
      },
      {
        email: username,
      },
    ],
  })
    .populate("Expert")
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
          console.log("Correct Login");
          res.json({
            status: 1,
            message: "Login Successful",
          });
        } else {
          res.json({
            status: 0,
            message: "Incorrect Password",
          });
        }
      }
    });
});

module.exports = router;
