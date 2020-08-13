var mongoose = require('mongoose');

var Admin = mongoose.Schema({
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
    address: String,
    picturePath: String
});

module.exports = mongoose.model('Admin', Admin);