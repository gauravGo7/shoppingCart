const express = require('express')
const mongoose = require('mongoose')
const router = require('./router/route')
const app = express()
app.use(express.json())
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://gaurav:Grv20072000@cluster0.3fqqw8s.mongodb.net/group15Database")
    .then(() => console.log("mongoDB is connected"))
    .catch((err) => console.error(err))

app.use("/", router)
app.listen(3000, () => {
    console.log("express app running on port" + 3000)
})