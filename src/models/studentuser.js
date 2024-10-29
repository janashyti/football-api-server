const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validator = require('validator')
const mongoose = require('mongoose') 

const Schema = mongoose.Schema

const userSchema = new Schema({ 
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
    gradYear: {
        type: Number,
        required: true
    },
    tokens: [String] 
})


userSchema.pre('save', async function(next) {

  
  const user = this
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  
  next()  // run the save() method
})


userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
   if (!user) {
       throw new Error("Unable to login");
   }
   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
       throw new Error("Unable to login - no match");
   }
   return user;
};



userSchema.methods.toJSON = function() {
  const user = this
  
  const userObject = user.toObject()
  
  delete userObject.password
  delete userObject.tokens
  delete userObject.email_verified
  delete userObject.__v
  
  
  return userObject
}

userSchema.methods.generateAuthToken = async function () {
  const user = this
 
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JSON_WEB_TOKEN_SECRET)

  user.tokens = user.tokens.concat(token)
  await user.save()

  return token
}


const User = mongoose.model('User', userSchema);

module.exports = User
