const express=require('express')
const router=express.Router()
const {createUser, updateUser, loginUser} = require("../controllers/userController")
const {authentication} = require("../middleware/middleware")

router.post("/register", createUser)
router.post("/login", loginUser)

router.put("/user/:userId/profile", authentication, updateUser)

router.all("/*",(req,res)=>{
    res.status(404).send({msg:"invalid http request"})
})

module.exports=router
