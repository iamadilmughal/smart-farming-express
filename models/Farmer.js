var mongoose = require('mongoose');

var FarmSchema = mongoose.Schema({
    farmId: Number,
    plants: [String],
    longitude: String,
    latitude: String,
    area: Number
});


var Farmer = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dob: String,
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: String,
    picturePath: String,
    address: String,
    farms: {
        type:[mongoose.Schema.Types.ObjectId],
        ref:'Farm'
    }
});

module.exports = mongoose.model('Farmer', Farmer);