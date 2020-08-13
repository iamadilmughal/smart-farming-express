var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DiseasesSchema = new Schema({
  diseaseID: { type: String, default: 0 },
  diseaseName: { type: String, required: true },
  description: String,
  severity: String,
  symptoms: [String],
  diseaseImage: String,
  cures: [String],
  causedBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Pests", required: true },
  ],
});
module.exports = mongoose.model("Diseases", DiseasesSchema);
