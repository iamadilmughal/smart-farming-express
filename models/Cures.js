var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CureSchema = new Schema({
	_id:mongoose.Schema.Types.ObjectId,
	cares:String,
	pesticides:[String],
	sprays:[String]
});
module.exports = mongoose.model('Cures',CureSchema);