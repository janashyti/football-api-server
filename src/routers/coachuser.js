const auth = require('../middleware/cauth')
const { sendVerificationEmail } = require('../emails/coachaccount.js')
const express = require('express')
const Coach = require('../models/coachuser')
const mongoose = require("mongoose")
const { get } = require("request-promise");


const router = new express.Router()



// Add a new user
router.post('/coachuser', async (req, res) => {
  delete req.body.email_verified
  delete req.body.tokens
  const user = new Coach(req.body)

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

router.get('/coachuser/verification', auth, async (req, res) => {
  const user = req.user
  const token = req.token

  console.log(user)
  console.log(token)

  user.email_verified = true
  user.save()

  res.send()
})


router.post('/coachuser/login', async (req, res) => {
  try {
    console.log(req.body.email)
    console.log(req.body.password)

    const user = await Coach.findByCredentials(req.body.email, req.body.password)
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


router.patch('/coachuser/logout', auth, async (req, res) => {
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



router.patch('/coachuser/editprofile', auth, async (req, res) => {
  const user = req.user
  //const coachuserID = req.params.id
  const mods = req.body
  let coachuser = undefined
  if (!mongoose.isValidObjectId(user._id)) {
      res.status(400).send("Invalid object id")
      return
  }
  try {
      coachuser = await Coach.findById(user._id)
      if (!coachuser) {
          res.status(400).send('Invalid user id')
          return
      }
  }
  catch (e) {
      console.log(e)
      res.status(500).send('Error finding user')
      return
  }
  
 
  const props = Object.keys(mods)
  const modifiable = [
      "email",
      "name",
      "school",
      "title",
      "coaching_position"  
  ]
  // check that all the props are modifable
  const isValid = props.every((prop) => modifiable.includes(prop))
  if (!isValid) {
      res.status(400).send("One or more invalid properties")
      return
  }
  try {

      // set new values
      props.forEach((prop) => coachuser[prop] = mods[prop])
      await coachuser.save()
      res.send(coachuser)
  }
  catch (e) {
      console.log(e)
      res.status(500).send("Error saving user")
  }
})



module.exports = router