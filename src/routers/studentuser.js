const auth = require('../middleware/auth')
const { sendVerificationEmail } = require('../emails/studentaccount.js')
const express = require('express')
const User = require('../models/studentuser')
const Coach = require('../models/coachuser')
const mongoose = require("mongoose")
const { get } = require("request-promise")
const cloudinary = require('cloudinary').v2
const multer = require('multer')


const router = new express.Router()



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
    res.status(400).send("Email already in use. Please try logging in or use a different email to create an account.")

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


router.patch('/studentuser/editprofile', auth, async (req, res) => {
  const user = req.user
  const mods = req.body
  let studentuser = undefined
  if (!mongoose.isValidObjectId(user._id)) {
    res.status(400).send("Invalid object id")
    return
  }
  try {
    studentuser = await User.findById(user._id)
    if (!studentuser) {
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
    "gradYear",
    "gpa",
    "position",
    "height",
    "weight",
    "forty_time",
    "pass_yards",
    "comp_percentage",
    "pass_tds",
    "pass_ints",
    "rec",
    "rec_yards",
    "red_tds",
    "rush_yards",
    "rush_tds",
    "yards_per_att",
    "tackles",
    "sacks",
    "ints",
    "tfls",
    "fg_made",
    "fg_missed",
    "punt_avg",
    "video",
    "image"
  ]
  // check that all the props are modifable
  const isValid = props.every((prop) => modifiable.includes(prop))
  if (!isValid) {
    res.status(400).send("One or more invalid properties")
    return
  }
  try {

    // set new values
    props.forEach((prop) => studentuser[prop] = mods[prop])
    await studentuser.save()
    res.send(studentuser)
  }
  catch (e) {
    console.log(e)
    res.status(500).send("Error saving user")
  }
})



router.get('/studentuser/data', auth, async (req, res) => {
  const user = req.user
  let filter = {
    $and: []
  }
  const projection = {

    email: 1,
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
    video: 1,
    image: 1
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
    const results = await User.find(filter, projection, options)
    res.send(results)
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
})



router.get('/studentuser/coachusers', auth, async (req, res) => {
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
    _id: 0,
    image: 1
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

  console.log(JSON.stringify(filter))

  try {
    const results = await Coach.find(filter, projection, options)
    res.send(results)
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
})




router.get('/studentusers', auth, async (req, res) => {
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
    video: 1,
    image: 1
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



const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/x-m4v',      
    'video/quicktime',   
    'video/webm'         
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  
  } else {
    cb(new Error('Please upload a valid video file'), false); 
  }
};


const upload = multer({
  storage,  
  limits: {
    fileSize: 8000000 
  },
  fileFilter  
});


router.post('/studentuser/uploadvideo', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: 'No video file uploaded' });
    }

    
    const result = await cloudinary.uploader.upload_stream(
      { 
        resource_type: "video", 
        folder: 'student_videos' 
      },
      async (error, cloudinaryResult) => {
        if (error) {
          return res.status(400).send({ error: error.message });
        }

        const videoUrl = cloudinaryResult.secure_url;

        const user = req.user;  
        user.video = videoUrl;
        await user.save();

        res.status(200).send({ message: "Video uploaded successfully!", videoUrl });
      }
    );

    result.end(req.file.buffer);

  } catch (error) {
    console.error(error);  
    res.status(400).send({ error: error.message });
  }
})




const imageFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Please upload a valid image file (jpg, jpeg, png, gif)'), false);
  }
};

const uploadimg = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: imageFilter,
});

router.post('/studentuser/uploadimage', auth, uploadimg.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: 'No image file uploaded' });
    }

    const result = await cloudinary.uploader.upload_stream(
      { folder: 'student_images', resource_type: 'image' },
      async (error, cloudinaryResult) => {
        if (error) {
          return res.status(400).send({ error: error.message });
        }

        const imageUrl = cloudinaryResult.secure_url;

        const user = req.user;
        user.image = imageUrl;
        await user.save();

        res.status(200).send({ message: 'Image uploaded successfully!', imageUrl });
      }
    );

    result.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});



module.exports = router
