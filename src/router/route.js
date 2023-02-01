const express=require('express')
const router=express.Router()
const {createUser, updateUser} = require("../controllers/userController")

router.post("/register", createUser)

router.put("/user/:userId/profile")

router.all("/*",(req,res)=>{
    res.status(404).send({msg:"invalid http request"})
})

module.exports=router
