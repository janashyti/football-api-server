const express = require('express') 
const router = express.Router() 
const mongoose = require('mongoose')
const Announcement = require('../models/announcement')
const auth = require('../middleware/cauth')
const Coach = require('../models/coachuser')
const Student = require('../models/studentuser')
const sauth = require('../middleware/auth')


router.post('/announcement', auth, async (req, res) => { 
    const user = req.user 
    let sender = await Coach.findById(user)
    try {
        const announcement = new Announcement({
            ...req.body,
            sender: user._id
        })
       
        await announcement.save()
        let arr = []
        arr = user.announcements
        arr.push(announcement.id) 
        sender.announcements = arr
        await sender.save()
        console.log(sender.announcements)
        res.status(201).send()
    }
    catch (error) {
        console.log(error)
        res.status(400).send()
    }

}) 


router.get('/announcements', auth, async (req, res) => {
    const user = req.user
    console.log(user)
  
    let filter = {
      $and: []
    }
    const projection = {
      title: 1,
      date: 1,
      position: 1,
      school: 1,
      description: 1,
      _id: 0
    }
    const options = {}
  
    if (req.query.hasOwnProperty('search')) {
    const searchTerm = req.query.search.trim();
    if (searchTerm) {
      filter.$and.push({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { position: { $regex: searchTerm, $options: 'i' } },
          { school: { $regex: searchTerm, $options: 'i' } }
        ]
      });
    }
  }
  
    try {
      const results = await Announcement.find(filter, projection, options)
      res.send(results)
    } catch (e) {
      console.log(e)
      res.status(500).send()
    }
  })




  router.get('/announcements/students', sauth, async (req, res) => {
    const user = req.user
    console.log(user)
  
    let filter = {
      $and: []
    }
    const projection = {
      title: 1,
      date: 1,
      position: 1,
      school: 1,
      description: 1,
      _id: 0
    }
    const options = {}
  
    if (req.query.hasOwnProperty('search')) {
    const searchTerm = req.query.search.trim();
    if (searchTerm) {
      filter.$and.push({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { position: { $regex: searchTerm, $options: 'i' } },
          { school: { $regex: searchTerm, $options: 'i' } }
        ]
      });
    }
  }
  
    try {
      const results = await Announcement.find(filter, projection, options)
      res.send(results)
    } catch (e) {
      console.log(e)
      res.status(500).send()
    }
  })


module.exports = router
module.exports = router