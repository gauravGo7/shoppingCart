const express=require('express')
const mongoose=require('mongoose')
const router=require('./router/route')
const multer = require("multer")

const app=express()
app.use(express.json())
app.use(multer().any())
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://gaurav:Grv20072000@cluster0.3fqqw8s.mongodb.net/group15Database")
    .then(() => console.log("MongoDB is Connected"))
    .catch((err) => console.error(err))

app.use("/",router)

app.listen(3000,()=>{
    console.log("Express App Running On Port " + 3000)
})