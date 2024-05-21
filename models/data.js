var mongoose = require('mongoose');
var Schema = mongoose.Schema;

dataSchema = new Schema( {
	data_id: Number,
	ex_id: Number,
	board_data: String,
	points: Number,
	comments: String,
}),
Data = mongoose.model('Data', dataSchema);

module.exports = Data;
