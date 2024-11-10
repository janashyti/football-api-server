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
  email_verified: {
    type: Boolean,
    default: false
},
  school: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  coaching_position: {
    type: String,
    required: false
  },
  announcements: [
    {type: Schema.Types.ObjectId, ref: 'Announcement'}
],
invitations: [
  {type: Schema.Types.ObjectId, ref: 'Invitation'}
],
invitationresponse: [
  {type: Schema.Types.ObjectId, ref: 'Invitation'}
],
image: {
  type: String,
  validate(value) {
    if (value && !validator.isURL(value)) {
      throw new Error('Image URL is invalid.')
    }
  }
},
  tokens: [String]
})

coachSchema.pre('save', async function (next) {

  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()  // run the save() method
})


coachSchema.statics.findByCredentials = async (email, password) => {
  const user = await Coach.findOne({ email });
   if (!user) {
       throw new Error("Unable to login");
   }
   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
       throw new Error("Unable to login - no match");
   }
   return user;
};

coachSchema.methods.toJSON = function () {
  const user = this

  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.email_verified
  delete userObject.__v

  return userObject
}

coachSchema.methods.generateAuthToken = async function () {
  const user = this

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JSON_WEB_TOKEN_SECRET)

  user.tokens = user.tokens.concat(token)
  await user.save()

  return token
}

coachSchema.index({ school: 'text', coaching_position: 'text'})

const Coach = mongoose.model('Coach', coachSchema);

module.exports = Coach