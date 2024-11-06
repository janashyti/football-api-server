const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const announcementSchema = new Schema({
    sender: { 
    type: Schema.Types.ObjectId,
    ref: 'Coach', 
    required: true
  },
    title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
  },
  position: {
    type: String,
    required: true
},
  school: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})



announcementSchema.methods.toJSON = function () {
  const user = this

  const userObject = user.toObject()

  return userObject
}



announcementSchema.index({ title: 'text', position: 'text', school: 'text'})

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement