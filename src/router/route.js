const express=require('express')
const router=express.Router()
const {createUser} = require("../controllers/userController")

router.post("/register", createUser)

router.all("/*",(req,res)=>{
    res.status(404).send({msg:"invalid http request"})
})

module.exports=router
