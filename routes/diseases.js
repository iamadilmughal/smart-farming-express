var express = require("express");
var router = express.Router();
var Diseases = require("../models/Diseases");
var cloudinary = require("cloudinary");
const upload = require("../config/multer");

var setpermission = function (req, res, next) {
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};

router.post("/", upload.single("diseaseImage"), setpermission, async function (
  req,
  res,
  next
) {
  console.log(req.body);

  var disease = new Diseases();

  disease.diseaseID = req.body.diseaseID;
  disease.diseaseName = req.body.name;
  disease.description = req.body.description;
  disease.symptoms = req.body.symptoms;
  disease.severity = req.body.severity;
  disease.cures = req.body.cures;
  disease.causedBy = req.body.causedBy.split(",");

  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    console.log(result);
    if (result) {
      disease.diseaseImage = result.url;
      console.log(disease.diseaseImage);
    }
  }

  disease
    .save()
    .then((result) => {
      res.status(200).json({
        status: 1,
        result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/:id", (req, res, next) => {
  var id = req.params.id;
  Diseases.findOne({
    _id: id,
  })
    .populate({
      path: "Disease",
      populate: {
        path: "causedBy",
        model: "pests",
      },
    })
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

router.get("/", (req, res, next) => {
  Diseases.find()
    .populate("pest", "_id pestName type")
    .exec()
    .then((result) => {
      // res.status(200).json(docs);
      res.status(200).json({
        count: result.length,
        DiseasesFound: result.map((doc) => {
          return {
            _id: doc._id,
            diseaseID: doc.diseaseID,
            diseaseName: doc.diseaseName,
            description: doc.description,
            symptoms: doc.symptoms,
            severity: doc.severity,
            diseaseImage: doc.diseaseImage,
            causedBy: doc.causedBy,
          };
        }),
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete("/:ID", (req, res, next) => {
  Diseases.deleteOne({ _id: req.params.ID })
    .exec()
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({
          status: 1,
          result,
        });
      } else {
        res.status(404).json({
          status: 0,
          message: "No Disease Found with given ID",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put(
  "/",
  upload.single("diseaseImage"),
  setpermission,
  async (req, res, next) => {
    var objForUpdate = {};

    console.log(req.body._id);

    if (req.body.diseaseID) objForUpdate.diseaseName = req.body.diseaseID;
    if (req.body.name) objForUpdate.diseaseName = req.body.name;
    if (req.body.description) objForUpdate.description = req.body.description;
    if (req.body.symptoms) objForUpdate.symptoms = req.body.symptoms;
    if (req.body.cures) objForUpdate.cures = req.body.cures;
    if (req.body.severity) objForUpdate.severity = req.body.severity;
    if (req.body.causedBy) objForUpdate.causedBy = req.body.causedBy.split(",");

    console.log(objForUpdate.causedBy)

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      console.log(result);
      if (result) {
        objForUpdate.diseaseImage = result.url;
        console.log(objForUpdate.diseaseImage);
      }
    }

    Diseases.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      objForUpdate,
      function (error, results) {
        if (error) {
          console.log(error)
          return next(error);
        }
        if (results !== null) {
          res.json({
            status: 1,
            message: "Disease Updated Successfully",
            object: results,
          });
        } else {
          res.status(404).json({
            status: 0,
            message: "Not Found",
            object: results,
          });
        }
      }
    ).catch((err) => {
      console.log(err);
    });
  }
);
module.exports = router;
