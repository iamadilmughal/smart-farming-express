var mongoose = require('mongoose');
var schema = mongoose.Schema({
	_id:mongoose.Schema.Types.ObjectId,
	UserName:String,
	Password:String,
	Email:String
});

module.exports = mongoose.model('Users',schema);