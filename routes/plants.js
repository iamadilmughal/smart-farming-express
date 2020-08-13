var express = require("express");
var router = express.Router();
require("dotenv").config();
var cloudinary = require("cloudinary");
require("../config/cloudinaryConfig");
const upload = require("../config/multer");
var Plants = require("../models/Plants");


var setpermission = function (req, res, next) {
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};


router.post("/", upload.single("plantImage"), async function (req, res, next) {
  console.log(req.body);
  var plant = new Plants({
    plantName: req.body.name,
    description: req.body.description,
    diseases: req.body.disease,
    season: req.body.season,
    pests: req.body.pests,
  });
  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    if (result) {
      plant.plantImage = result.url;
      console.log(plant.plantImage);
    }
  }
  plant
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json(err);
      console.log(err);
    });
});

router.get("/", (req, res, next) => {
  Plants.find()
    .populate("diseases causedBy", "diseaseName symptoms pestName")
    .exec()
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.get("/:id", (req, res, next) => {
  Plants.findOne({ _id: req.params.id })
    .populate()
    .exec()
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.put("/", upload.single("plantImage"), setpermission, async function (
  req,
  res,
  next
) {
  var objForUpdate = {};

  if (req.body.name) objForUpdate.plantName = req.body.name;
  if (req.body.description) objForUpdate.description = req.body.description;
  if (req.body.diseases) objForUpdate.diseases = req.body.disease;
  if (req.body.season) objForUpdate.season = req.body.season;
  if (req.body.pests) objForUpdate.rating = req.body.pests;

  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    if (result) {
      objForUpdate.plantImage = result.url;
      console.log(objForUpdate.plantImage);
    }
  }

  Plants.findOneAndUpdate(
    {
      _id: req.body.id,
    },
    objForUpdate,
    function (error, results) {
      if (error) {
        return next(error);
      }
      res.json({
        status: 1,
        message: "Plant Updated Successfully",
        object: results,
      });
    }
  );
});

router.delete("/:id", setpermission, function (req, res, next) {
  var id = req.params.id;
  Plants.deleteOne(
    {
      _id: id,
    },
    function (error, results) {
      if (error) {
        return next(error);
      }
      if (results.deletedCount > 0) {
        res.json({
          status: 1,
          message: "Plant Deleted Successfully",
        });
      } else {
        res.status(404).json({
          status: 0,
          message: "Plant Not Found",
        });
      }
    }
  );
});

module.exports = router;
