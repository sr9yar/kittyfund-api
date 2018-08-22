const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    login: { type: String, unique: true },
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    salt: { type: String, default: '' },
    active: { type: Boolean, default: true },
    creator_id: { type: String, default: '' },
    name: { type: String, default: '' },
    surname: { type: String, default: '' },
    patronimic: { type: String, default: '' },

    phone: { type: String, default: '' },
    role: { type: String, default: 'user' },

    vk_id: { type: String, default: '' },
    settings: {
      receive_email: { type: Boolean, default: true },
      receive_sms: { type: Boolean, default: true },
      language: { type: String, default: 'ru' }
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('User', UserSchema)
