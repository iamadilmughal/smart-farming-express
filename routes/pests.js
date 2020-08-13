var express = require("express");
var router = express.Router();
require("dotenv").config();
var cloudinary = require("cloudinary");
require("../config/cloudinaryConfig");
const upload = require("../config/multer");
var Pests = require("../models/Pests");

var setpermission = function (req, res, next) {
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};

router.post("/", upload.single("pestImage"), async function (req, res, next) {
  const pest = new Pests({
    pestName: req.body.name,
    description: req.body.description,
    scientificName: req.body.scientificName,
    diagnostics: req.body.diagnostics,
    prevention: req.body.prevention.split(";"),
    severity: req.body.severity,
  });
  console.log(req.body);
  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    console.log(result);
    if (result) {
      pest.pestImage = result.url;
    }
  }
  console.log(pest);
  pest
    .save()
    .then((result) => {
      res.status(200).json({
        status: 1,
        Message: "New pest information have been added",
        result,
      });
    })
    .catch((err) => {
      res.status(500).json(err);
      console.log(err);
    });
});

router.get("/", (req, res, next) => {
  Pests.find()
    .exec()
    .then((result) => {
      res.status(200).json({
        status: 1,
        result,
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.put("/", upload.single("pestImage"), setpermission, async function (
  req,
  res,
  next
) {
  var objForUpdate = {};
  if (req.body.name) objForUpdate.pestName = req.body.name;
  if (req.body.description) objForUpdate.description = req.body.description;
  if (req.body.scientificName)
    objForUpdate.scientificName = req.body.scientificName;
  if (req.body.diagnostics) objForUpdate.diagnostics = req.body.diagnostics;
  if (req.body.prevention) objForUpdate.prevention = req.body.prevention.split(";");
  if (req.body.severity) objForUpdate.severity = req.body.severity;

  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    if (result) {
      objForUpdate.pestImage = result.url;
      console.log(objForUpdate.pestImage);
    }
  }

  Pests.findOneAndUpdate(
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
        message: "Pest Updated Successfully",
        object: results,
      });
    }
  );
});

router.get("/:id", (req, res, next) => {
  var id = req.params.id;
  Pests.findOne({
    _id: id,
  }).exec(function (error, results) {
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

router.post("/list", setpermission, (req, res, next) => {
  console.log(req.body.list);
  Pests.find({ _id: { $in: req.body.list } })
    .exec()
    .then((result) => {
      res.status(200).json({
        status: 1,
        result,
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.delete("/:ID", (req, res, next) => {
  Pests.remove({ _id: req.params.ID })
    .exec()
    .then((result) => {
      res
        .status(200)
        .json({ status: 1, message: "Pest Deleted Sucessfully", result });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});
router.patch("/", (req, res, next) => {});
module.exports = router;
