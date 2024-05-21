var mongoose = require('mongoose');
var Schema = mongoose.Schema;

answerSchema = new Schema( {
	answer_id: Number,
	ex_id: Number,
	answer_data: String,
	points: Number,
	comments: String,
}),
Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
