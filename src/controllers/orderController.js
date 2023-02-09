const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
const { validObjectId } = require('../validator/validation')

exports.createOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        if(!validObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid user id" })
        const userExist=await userModel.findById(userId)
        if(!userExist) return res.status(404).send({status:false,message:"user does not exist with the userId"})

        const loggedUserId = req.token.userId;
        if (userId != loggedUserId) return res.status(403).send({ status: false, message: "unauthorized access" })
        const data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please Provide Some Data for create an Order" })

        const { cartId } = data
        if (!cartId) return res.status(400).send({ status: false, message: "CartId is required in body" })
        if (!validObjectId(cartId)) return res.status(400).send({ staus: false, message: "Please provide a valid cartId" });

        const cartCheck = await cartModel.findOne({ userId: userId, _id: cartId })
        if (!cartCheck) return res.status(400).send({ staus: false, message: "Cart not found" });
        if (cartCheck.items.length == 0) return res.status(400).send({ status: false, message: "No product found in items" })

        let totalQuantity = 0
        for (let i = 0; i < cartCheck.items.length; i++) {
            totalQuantity = totalQuantity + cartCheck.items[i].quantity
        }

        const obj = {
            userId: userId,
            items: cartCheck.items,
            totalPrice: cartCheck.totalPrice,
            totalItems: cartCheck.totalItems,
            totalQuantity: totalQuantity,
            cancellable: data.cancellable
        }

        const order = await orderModel.create(obj)
        const orderId=order._id;
        const resObj=await orderModel.findById(orderId).select({__v:0})
        await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalItems: 0, totalPrice: 0 } }, { new: true })

        res.status(200).send({ status: true, message: "Success", data: resObj })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

exports.updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId;
        if (!validObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid user id" })
        const userExist=await userModel.findById(userId)
        if(!userExist) return res.status(404).send({status:false,message:"user does not exist with the userId"})

        const loggedUserId = req.token.userId;
        if (userId != loggedUserId) return res.status(403).send({ status: false, message: "unauthorized access" })

        let { orderId, cancellable, status } = req.body;
        if (!orderId) return res.status(400).send({ status: false, message: "please provide orderId in request body" })
        if (!validObjectId(orderId)) return res.status(400).send({ status: false, message: "Invalid orderId" })

        const orderData = await orderModel.findById(orderId)
        if (!orderData) return res.status(400).send({ status: false, message: "No active order found by this orderId" })
        if (orderData.status == "cancelled") return res.status(200).send({ status: true, message: "Your order has been cancelled" })

        if (orderData.userId != userId) return res.status(400).send({ status: false, message: "The order is not relevant to this user" })

        if ((cancellable === "undefined") && !status) {
            return res.status(400).send({ status: false, message: "Atleast one field is required among status and cancellable" })
        }
        let updateObj = {}
        if (cancellable == "true" || cancellable == "false") {
            updateObj.cancellable = (cancellable == "true" ? true : false)
        }
        if (status) {
            status = status.trim().toLowerCase()
            if (!["pending", "completed", "cancelled"].includes(status)) return res.status(400).send({ status: false, message: "please provide valid status" })
            if (orderData.cancellable == false && status == "cancelled") return res.status(400).send({ status: false, message: "Your order can't be cancelled" })

            updateObj.status = status;

        }
        let updateOrder = await orderModel.findOneAndUpdate({ _id: orderId }, updateObj, { new: true }).select({__v:0})
        return res.status(200).send({ status: true, message: "Success", data: updateOrder })
    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}