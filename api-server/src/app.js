require('dotenv').config({ debug: true });

const express = require('express') 
require('./database/mongoose')

const cors = require('cors'); 
const userRouter = require('./routers/studentuser')

const app = express() 

app.use(cors()) 
app.use(function (req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next(); 
}); 
  
app.use(express.json()) 
app.use(userRouter)


const port = process.env.PORT || 3010 
app.listen(port, () => { 
    console.log('Server is up on port ' + port) 
})

//this is a little test