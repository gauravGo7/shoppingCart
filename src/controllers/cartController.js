const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const cartModel = require("../models/cartModel")
const jwt = require("jsonwebtoken")

exports.updateCart = async function (req, res) {
    try {

        const userId = req.params.userId
        const data = req.body
        let { cartId, productId, removeProduct } = data

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please provide some Data" })

        if (!cartId) return res.status(400).send({ status: false, message: "CartId is required" })
        if (!productId) return res.status(400).send({ status: false, message: "productId is required" })

        if (!validObjectId(cartId)) return res.status(400).send({ status: false, message: "Please provide valid cartId" })
        if (!validObjectId(productId)) return res.status(400).send({ status: false, message: "Please provide valid productId" })

        const cartCheck = await cartModel.findById({ _id: cartId })
        if (!cartCheck) return res.status(404).send({ status: false, message: "cartId not found" })

        const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) return res.status(404).send({ status: false, message: "productId not found" })

        if (removeProduct != 0 && removeProduct != 1) return res.status(400).send({ status: false, message: "please input a Number 0 or 1 in removeProduct Key" })
        if (cartCheck.items.length == 0) return res.status(400).send({ status: false, message: "No product found in items" })

        //................Remove Item from the Cart...................
        if (removeProduct == 0) {
            for (let i = 0; i < cartCheck.items.length; i++) {
                if (cartCheck.items[i].productId == productId) {
                    const ProductPrice = checkProduct.price * cartCheck.items[i].quantity
                    const totalprice = cartCheck.totalPrice - ProductPrice
                    cartCheck.items.splice(i, 1)
                    const totalItems = cartCheck.totalItems - 1
                    const finalPriceAndUpdate = await cartModel.findOneAndUpdate({ userId: userId }, { items: cartCheck.items, totalPrice: totalprice, totalItems: totalItems }, { new: true }).select({ 'items._id': 0 })
                    return res.status(200).send({ status: true, message: "Success", data: finalPriceAndUpdate });
                }
            }

            //.................. Reduce/Remove Product Quantity.................
        } else if (removeProduct == 1) {
            for (let i = 0; i < cartCheck.items.length; i++) {
                if (cartCheck.items[i].productId == productId) {
                    const quantityUpdate = cartCheck.items[i].quantity - 1

                    //........Remove product from cart................
                    if (quantityUpdate < 1) {
                        const ProductPrice = checkProduct.price * cartCheck.items[i].quantity
                        const totalPrice = cartCheck.totalPrice - ProductPrice
                        cartCheck.items.splice(i, 1)
                        const totalItems = cartCheck.totalItems - 1
                        const finalPriceUpdate = await cartModel.findOneAndUpdate({ userId: userId }, { items: cartCheck.items, totalPrice: totalPrice, totalItems: totalItems }, { new: true }).select({ 'items._id': 0 })
                        return res.status(200).send({ status: true, message: "Success", data: finalPriceUpdate });

                    } else {
                        //..............Reduce Quantity of product.................
                        const totalPrice = cartCheck.totalPrice - checkProduct.price
                        const totalItems = cartCheck.totalItems
                        cartCheck.items[i].quantity = quantityUpdate

                        const finalPriceAndUpdate = await cartModel.findOneAndUpdate({ userId: userId }, { items: cartCheck.items, totalPrice: totalPrice, totalItems: totalItems }, { new: true }).select({ 'items._id': 0 })
                        return res.status(200).send({ status: true, message: "Success", data: finalPriceAndUpdate });
                    }
                }
            }
            return res.status(400).send({ status: false, message: "No productId found in items" })

        }


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}