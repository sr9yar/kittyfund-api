var mongoose = require('mongoose');

var ListSchema = new mongoose.Schema(
	{

		id: Number,
		active: { type: Boolean, default: true },
		creator_id: { type: String, default: '' },
		name: String,
		people: [{ 
			name: { type: String, default: '' },
			surname: { type: String, default: '' },
			patronimic: { type: String, default: '' },
			
			deposited: { type: Number, default: 0 },
			expected: { type: Number, default: 0 },
			left: { type: Number, default: 0 },
			
			phone: { type: String, default: '' }
			}],

	},
	{
		timestamps: true
	}
);



module.exports = mongoose.model('List', ListSchema);