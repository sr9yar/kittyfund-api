const mongoose = require('mongoose')

const FundSchema = new mongoose.Schema(
  {

    id: Number,
    creator_id: { type: String, default: '' },
    active: { type: Boolean, default: true },
    name: { type: String, default: '' },
    goal: { type: Number, default: 0 },
    expected: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
    deposited: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    people: [{
      name: { type: String, default: '' },
      surname: { type: String, default: '' },
      patronimic: { type: String, default: '' },

      deposited: { type: Number, default: 0 },
      expected: { type: Number, default: 0 },
      left: { type: Number, default: 0 },

      phone: { type: String, default: '' }
    }],
    expenses: [{ name: String, sum: Number }]

  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Fund', FundSchema)
