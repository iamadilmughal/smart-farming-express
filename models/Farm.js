var mongoose = require('mongoose');

var FarmSchema = mongoose.Schema({
    farmId: Number,
    plants: [String],
    longitude: String,
    latitude: String,
    area: Number
});


module.exports = mongoose.model('Farm', FarmSchema);