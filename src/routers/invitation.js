const express = require('express') 
const router = express.Router() 
const mongoose = require('mongoose')
const Invitation = require('../models/invitation')
const auth = require('../middleware/cauth')
const Coach = require('../models/coachuser')
const Student = require('../models/studentuser')
const sauth = require('../middleware/auth')



router.post('/invitation', auth, async (req, res) => { 
    const user = req.user 
    let sender = await Coach.findById(user)
    const receiverID = req.body.receiver
    const receiver = await Student.findById(receiverID)
    try {
        const invitation = new Invitation({
            ...req.body,
            sender: user._id,
            receiver: receiver._id
        })
       
        await invitation.save()
        let arr = []
        arr = user.invitations
        arr.push(invitation.id) 
        sender.invitations = arr
        await sender.save()

        let studentarr = []
        studentarr = receiver.invitations
        studentarr.push(invitation.id)
        receiver.invitations = studentarr
        await receiver.save()
        console.log(sender.invitations)

        res.status(201).send()
    }
    catch (error) {
        console.log(error)
        res.status(400).send()
    }

}) 




router.get('/invitations/:id', sauth, async (req, res) => {
    let userID = req.params.id
    let user
    
    if (!mongoose.isValidObjectId(userID)) {
      res.status(400).send("Invalid object id")
      return
    }
    try {
      user = await Student.findById(userID)
      if (!user) {
        res.status(400).send('Invalid invitation id')
        return
      }
    }
    catch (e) {
      console.log(e)
      res.status(500).send('Error finding invitation')
      return
    }
  
    try {
      const invitationArray = user.invitations
      console.log(invitationArray)
      console.log(invitationArray[0])
      const results = []
      for(let i = 0; i < invitationArray.length; i++){
        results[i] = await Invitation.findById(invitationArray[i])
      }
      
      console.log(results)
      res.send(results)
    } catch (e) {
      console.log(e)
      res.status(500).send()
    }
  
})  


router.post('/invitation/response', sauth, async (req, res) => { 
  const user = req.user 
  let sender = await Student.findById(user)
  const receiverID = req.body.receiver
  const receiver = await Coach.findById(receiverID)
  try {
      const invitation = new Invitation({
          ...req.body,
          sender: user._id,
          receiver: receiver._id
      })
     
      await invitation.save()
      let arr = []
      arr = user.invitationresponse
      arr.push(invitation.id) 
      sender.invitationresponse = arr
      await sender.save()

      let studentarr = []
      studentarr = receiver.invitationresponse
      studentarr.push(invitation.id)
      receiver.invitationresponse = studentarr
      await receiver.save()
      console.log(sender.invitationresponse)

      res.status(201).send()
  }
  catch (error) {
      console.log(error)
      res.status(400).send()
  }

}) 



router.get('/invitation/response/:id', auth, async (req, res) => {
  let userID = req.params.id
  let user
  
  if (!mongoose.isValidObjectId(userID)) {
    res.status(400).send("Invalid object id")
    return
  }
  try {
    user = await Coach.findById(userID)
    if (!user) {
      res.status(400).send('Invalid invitation id')
      return
    }
  }
  catch (e) {
    console.log(e)
    res.status(500).send('Error finding invitation')
    return
  }

  try {
    const invitationArray = user.invitationresponse
    const results = []
    for(let i = 0; i < invitationArray.length; i++){
      results[i] = await Invitation.findById(invitationArray[i])
    }
    
    console.log(results)
    res.send(results)
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }

})  


router.delete('/invitation/:id', sauth, async (req, res) => {
  const user = req.user
  const invitationId = req.params.id
  let invitation = null
  if (!mongoose.isValidObjectId(invitationId)) {
      res.status(400).send("Invalid request")
      return
  }
  try {
      invitation = await Invitation.findById(invitationId)

      if (!invitation) {
          res.status(400).send("Invitation not found.")
          return
      }

      await invitation.deleteOne()
      res.send()
  }
  catch (e) {
      console.log(e)
      res.status(500).send()
  }
})

module.exports = router






