var mongoose = require("mongoose");

var Expert = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dob: String,
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: String,
  address: String,
  rating: {
    type: Number,
    default: 0,
  },
  picturePath: {
    type: String,
    default:
      "https://res.cloudinary.com/smartfarming/image/upload/v1592945653/iStock-476085198_awv0al.jpg",
  },
});

module.exports = mongoose.model("Expert", Expert);
