const auth = require('../middleware/cauth')
const { sendVerificationEmail } = require('../emails/coachaccount.js')
const express = require('express')
const Coach = require('../models/coachuser')
const User = require('../models/studentuser')
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
    res.status(400).send("Email already in use. Please try logging in or use a different email to create an account.")
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


router.get('/coachuser/data', auth, async (req, res) => {
  const user = req.user
  let filter = {
    $and: []
  }
  const projection = {
    email: 1,
    name: 1,
    school: 1,
    title: 1,
    coaching_position: 1,
    _id: 0
  }
  const options = {}
  filter.$and.push({
    $or: [
      { _id: user._id }
    ]
  })


  if (req.query.hasOwnProperty('search')) {
    filter.$and.push({
      $text: {
        $search: req.query.search
      }
    })
  }

  console.log(JSON.stringify(filter))

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    options.sort = {}
    options.sort[parts[0]] = (parts[1] == 'asc') ? 1 : -1
  }

  if (req.query.limit) {
    options.limit = req.query.limit
  }

  if (req.query.skip) {
    options.skip = req.query.skip
  }

  try {
    const results = await Coach.find(filter, projection, options)
    res.send(results)
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
})



router.get('/coachusers', auth, async (req, res) => {
  const user = req.user
  console.log(user)

  let filter = {
    $and: []
  }
  const projection = {
    email: 1,
    name: 1,
    school: 1,
    title: 1,
    coaching_position: 1,
    _id: 0
  }
  const options = {}

  if (req.query.hasOwnProperty('search')) {
  const searchTerm = req.query.search.trim();
  if (searchTerm) {
    filter.$and.push({
      $or: [
        { school: { $regex: searchTerm, $options: 'i' } },
        { coaching_position: { $regex: searchTerm, $options: 'i' } }
      ]
    });
  }
}

  try {
    const results = await Coach.find(filter, projection, options)
    res.send(results)
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
})




router.get('/coachuser/studentusers', auth, async (req, res) => {
  const user = req.user
  console.log(user)

  let filter = {
    $and: []
  }
  const projection = {
    name: 1,
    school: 1,
    gradYear: 1,
    gpa: 1,
    position: 1,
    height: 1,
    weight: 1,
    forty_time: 1,
    pass_yards: 1,
    comp_percentage: 1,
    pass_tds: 1,
    pass_ints: 1,
    rec: 1,
    rec_yards: 1,
    red_tds: 1,
    rush_yards: 1,
    rush_tds: 1,
    yards_per_att: 1,
    tackles: 1,
    sacks: 1,
    ints: 1,
    tfls: 1,
    fg_made: 1,
    fg_missed: 1,
    punt_avg: 1,
    _id: 0,
    video
  }
  const options = {}


  if (req.query.hasOwnProperty('search')) {
    const searchTerm = req.query.search.trim();
    if (searchTerm) {
      const filterConditions = {
        $or: [
          { school: { $regex: searchTerm, $options: 'i' } },
          { position: { $regex: searchTerm, $options: 'i' } },
        ]
      }

      const parsedGradYear = parseInt(searchTerm, 10);
        if (!isNaN(parsedGradYear)) {
            filterConditions.$or.push({ gradYear: parsedGradYear });
        }
        filter.$and.push(filterConditions)
    }
  }

  try {
    const results = await User.find(filter, projection, options)
    res.send(results)
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
})




module.exports = router