const auth = require('../middleware/auth')
//const { sendVerificationEmail } = require('../emails/account.js')
const express = require('express')
const User = require('../models/studentuser')
const mongoose = require("mongoose")
//const { IgApiClient } = require("instagram-private-api");
const { get } = require("request-promise");


const router = new express.Router()

console.log("hi")

// Add a new user
router.post('/studentuser', async (req, res) => {
  //delete req.body.email_verified
  delete req.body.tokens
  const user = new User(req.body)
  console.log("hello")

  try {
    await user.save()
    const token = await user.generateAuthToken()
    console.log(token)
    console.log("success")
    //sendVerificationEmail(user.email, user.username, token)
    res.status(201).send(user)
  }
  catch (error) {
    res.status(400).send(error)
    const token = await user.generateAuthToken()
    console.log(token)
  }
})

module.exports = router
console.log(User)