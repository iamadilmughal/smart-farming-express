var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PestsSchema = new Schema({
  pestName: { type: String, required: true },
  scientificName: String,
  description: String,
  diagnostics: String,
  severity: String,
  prevention: [String],
  pestImage: String,
});

module.exports = mongoose.model("Pests", PestsSchema);
