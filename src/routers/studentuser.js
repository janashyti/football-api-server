const auth = require('../middleware/auth')
const { sendVerificationEmail } = require('../emails/studentaccount.js')
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

  try {
    await user.save()
    const token = await user.generateAuthToken()
    sendVerificationEmail(user.email, user.name, token)
    res.status(201).send(user)
  }
  catch (error) {
    res.status(400).send(error)
    
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

router.post('/studentuser/login', async (req, res) => {
  try {
    console.log(req.body.email)
    console.log(req.body.password)

    const user = await User.findByCredentials(req.body.email, req.body.password)
    console.log(user)

    if (user.email_verified === true) {
      const token = await user.generateAuthToken()
      res.status(200).send({ user, token })
    }
    else {
      res.status(401).send("Email has not been verified.")
    }
  }
  catch (e) {
    console.log(e)
    res.status(500).send()
  }
})


router.patch('/studentuser/logout', auth, async (req, res) => {
  const user = req.user
  try {
    user.tokens = user.tokens.filter((token) => {
      return token !== req.token
    })
    await user.save()

    res.send()
  }
  catch (e) {
    res.status(500).send()
  }
})

module.exports = router
