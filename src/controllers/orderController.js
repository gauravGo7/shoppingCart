const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const { validObjectId } = require('../validator/validation')

exports.createOrder = async function (req, res) {
    try {
        const userId = req.params.userId
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
        await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalItems: 0, totalPrice: 0 } }, { new: true })

        res.status(201).send({ status: true, message: "Success", data: order })
    } 
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}