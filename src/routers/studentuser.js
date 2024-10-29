const auth = require('../middleware/auth')
const { sendVerificationEmail } = require('../emails/coachaccount.js')
const express = require('express')
const User = require('../models/studentuser')
const mongoose = require("mongoose")
const { get } = require("request-promise");


const router = new express.Router()

console.log("hi")

// Add a new user
router.post('/studentuser', async (req, res) => {
  delete req.body.email_verified
  delete req.body.tokens
  const user = new User(req.body)
  console.log("hello")

  try {
    await user.save()
    const token = await user.generateAuthToken()
    sendVerificationEmail(user.email, user.name, token)
    res.status(201).send(user)
  }
  catch (error) {
    res.status(400).send(error)
    
    console.log(token)
  }
})


router.get('/studentuser/verification', auth, async (req, res) => {
  const user = req.user
  const token = req.token

  console.log(user)
  console.log(token)

  user.email_verified = true
  user.save()

  res.send()
})

module.exports = router
console.log(User)