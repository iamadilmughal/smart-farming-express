var express = require("express");
var router = express.Router();
require("dotenv").config();
var cloudinary = require("cloudinary");
require("../config/cloudinaryConfig");
const upload = require("../config/multer");

// var upload = multer({
//   destination: "/uploads/PostImages",
//   filename: function (req, file, callback) {
//     crypto.pseudoRandomBytes(16, function(err, raw) {
//         if (err) return callback(err);
//         callback(null, raw.toString('hex') + path.extname(file.originalname));
//       });
//   }
// });
var Post = require("../models/Post");

var setpermission = function (req, res, next) {
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};

router.get("/", setpermission, (req, res, next) => {
  Post.find()
    .sort({
      datePosted: -1,
    })
    .exec()
    .then((results) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post(
  "/",
  upload.single("postImage"),
  setpermission,
  async (req, res, next) => {
    // console.log("Request Here");

    var post = new Post({
      postedBy: req.body.postedBy,
      postTitle: req.body.postTitle,
      datePosted: req.body.datePosted,
      category: req.body.category,
      postDescription: req.body.postDescription,
      upvotes: req.body.upvotes,
      downvotes: req.body.downvotes,
      image: "",
    });
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      console.log(result);
      if (result) {
        post.image = result.url;
        console.log(post.image);
      }
    }
    post
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
  }
);

router.put("/", upload.single("postImage"), setpermission, function (
  req,
  res,
  next
) {
  var objForUpdate = {};

  if (req.body.postDescription)
    objForUpdate.postDescription = req.body.postDescription;
  if (req.file.originalname) objForUpdate.postImage = req.file.originalname;

  Post.findOneAndUpdate(
    {
      _id: req.body.postID,
    },
    objForUpdate,
    function (error, results) {
      if (error) {
        return res.status(500).json(error);
      }
      if (results === null) {
        res.status(404).json({
          status: 0,
          message: "No Post Found with given ID",
        });
      } else {
        res.json({
          status: 1,
          message: "Post Updated Successfully",
          object: results,
        });
      }
    }
  );
});

router.delete("/", setpermission, function (req, res, next) {
  var id = req.body.postID;
  Post.deleteOne(
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
          message: "Post Deleted Successfully",
        });
      } else {
        res.status(400).json({
          status: 0,
          message: "No Post Found with given ID",
        });
      }
    }
  );
});

router.put("/upvote", setpermission, function (req, res, next) {
  Post.findOneAndUpdate(
    {
      _id: req.body.postID,
    },
    {
      $inc: {
        upvotes: 1,
      },
    },
    function (error, result) {
      if (error) {
        res.status(500).json({
          status: 0,
          error: error,
        });
      } else {
        if (result !== null) {
          res.json({
            status: 1,
            message: "Successfully Upvoted",
          });
        } else {
          res.status(404).json({
            status: 0,
            message: "No Post Found with Specified ID",
          });
        }
      }
    }
  );
});

router.get("/post/:id", setpermission, function (req, res, next) {
  var id = req.params.id;
  Post.findOne(
    {
      _id: id,
    },
    function (error, results) {
      if (error) {
        res.status(500).json({
          status: 0,
          error: error,
        });
      } else {
        if (!results) {
          res.status(404).json({
            status: 0,
            message: "Post Not Found",
          });
        } else {
          res.json({
            status: 1,
            results: results,
          });
        }
      }
    }
  );
});

router.get("/category/:category", setpermission, function (req, res, next) {
  Post.find(
    {
      category: req.params.category,
    },
    function (error, results) {
      if (error) {
        res.status(500).json({
          status: 0,
          error: error,
        });
      } else {
        if (!results) {
          res.status(404).json({
            status: 0,
            message: "No Post Found for the specified category",
          });
        } else {
          res.json({
            status: 1,
            results: results,
          });
        }
      }
    }
  );
});

router.put("/downvote", setpermission, function (req, res, next) {
  Post.findOneAndUpdate(
    {
      _id: req.body.postID,
    },
    {
      $inc: {
        downvotes: 1,
      },
    },
    function (error, result) {
      if (error) {
        res.status(500).json({
          status: 0,
          error: error,
        });
      } else {
        if (result !== null) {
          res.json({
            status: 1,
            message: "Successfully Downvoted",
          });
        } else {
          res.status(404).json({
            status: 0,
            message: "No Post Found with Specified ID",
          });
        }
      }
    }
  );
});

router.post("/comment", setpermission, function (req, res, next) {
  var comment = {
    username: req.body.username,
    date: req.body.date,
    text: req.body.text,
  };
  Post.findOneAndUpdate(
    {
      _id: req.body.postID,
    },
    {
      $push: {
        comments: comment,
      },
    },
    function (error, result) {
      if (error) {
        res.status(500).json(error);
      } else {
        if (result !== null) {
          res.json({
            status: 1,
            message: "Comment Added Successfully",
          });
        } else {
          res.status(404).json({
            status: 0,
            message: "No Post Found with Specified ID",
          });
        }
      }
    }
  );
});

module.exports = router;
