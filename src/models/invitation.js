const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const invitationSchema = new Schema({
    sender: { 
    type: Schema.Types.ObjectId,
    ref: 'Coach', 
    required: true
  },
  receiver: { 
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  subject: {
    type: String,
    required: true
  },
    description: {
    type: String,
    required: true
  }
})


invitationSchema.methods.toJSON = function () {
  const user = this

  const userObject = user.toObject()

  return userObject
}


const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation