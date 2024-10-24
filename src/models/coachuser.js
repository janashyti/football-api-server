const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const coachSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid.')
      }
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 8
  },
  school: {
    type: String,
    required: true
  },
  tokens: [String]
})

coachSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  return userObject
}

coachSchema.pre('save', async function (next) {


  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()  // run the save() method
})



coachSchema.methods.toJSON = function () {
  const user = this

  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  //delete userObject.email_verified
  //delete userObject.__v

  return userObject
}

coachSchema.methods.generateAuthToken = async function () {
  const user = this

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JSON_WEB_TOKEN_SECRET)

  user.tokens = user.tokens.concat(token)
  await user.save()

  return token
}


const Coach = mongoose.model('Coach', coachSchema);

module.exports = Coach