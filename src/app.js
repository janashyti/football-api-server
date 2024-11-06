require('dotenv').config({ debug: true });

const express = require('express') 
require('./database/mongoose')

const cors = require('cors'); 
const userRouter = require('./routers/studentuser')
const coachRouter = require('./routers/coachuser')
const announcementRouter = require('./routers/announcement')

const app = express() 

app.use(cors()) 
app.use(function (req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next(); 
}); 
  
app.use(express.json()) 
app.use(userRouter)
app.use(coachRouter)
app.use(announcementRouter)

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



const port = process.env.PORT || 3010 
app.listen(port, () => { 
    console.log('Server is up on port ' + port) 
})