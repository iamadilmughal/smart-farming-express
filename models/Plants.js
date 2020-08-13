var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PlantsSchema = new Schema({
  plantName: { type: String, required: true },
  description: String,
  season: String,
  plantImage: String,
  pests: {
    type: [String]
  },
  diseases: [String]
});

module.exports = mongoose.model("Plants", PlantsSchema);
