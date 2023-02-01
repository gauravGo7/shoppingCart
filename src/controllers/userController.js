const userModel = require("../models/userModel");

exports.getProfile = async function (req, res) {
    try {
        const userId = req.params.userId;

        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "Please provide valid user id" })

        const loggedUser = req.token.userId;
        if (userId != loggedUser) return res.status(403).send({ status: false, message: "you can't see other people's profile" })

        const profileData = await userModel.findById(userId)
        return res.status(200).send({ status: true, message: "User profile details", data: profileData })
    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}