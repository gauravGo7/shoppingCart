const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const cartModel = require("../models/cartModel")
const { validObjectId } = require("../validator/validation")

exports.createCart = async (req, res) => {
    try {

        let item = []
        let data = {}

        let userId = req.params.userId
        if(!validObjectId(userId)) return res.status(400).send({status:false,message:"Please provide valid user id 😥"})
        let loggedUser = req.token.userId
        if (userId !== loggedUser) return res.status(403).send({ status: false, message: "Unauthorized access" })

        let productId = req.body.productId
        if(!validObjectId(productId)) return res.status(400).send({status:false,message:"Please provide valid product id 😬"})
        let cartId = req.body.cartId
        if(!validObjectId(cartId)) return res.status(400).send({status:false,message:"Please provide valid cart id 😬"})
        let product = await productModel.findOne({ _id: productId })
        let price = product.price
        if (!product) return res.status(404).send({ status: false, message: "Product Not Found" })
        let isCart = await cartModel.findOne({ userId: userId })

        if (!isCart) {
            let products = { productId: productId, quantity: 1 }
            data.userId = userId
            item.push(products)
            data.items = item
            data.totalPrice = price
            data.totalItems = 1

            let createdData = await cartModel.create(data)
            let x = await cartModel.find({ userId: userId }).select({ "items._id": 0 })
            return res.status(201).send({ status: true, message: "Success", data: x })
        }
        else {
            let cart = await cartModel.findOne({ _id: cartId })
            if (!cart) return res.status(404).send({ status: false, message: "Please provide valid cartId" })

            let existingCart = await cartModel.findOne({ _id: cartId, "items.productId": productId }).lean()
            let totalPrice = cart.totalPrice + price
            let existingProduct = await cartModel.findOne({ _id: cartId, "items.productId": productId }).lean()
            if (!existingProduct) {
                let product = { productId: productId, quantity: 1 }
                existingCart = await cartModel.findByIdAndUpdate({ _id: cartId }, { $push: { items: product }, $inc: { totalItems: 1 }, $set: { totalPrice: totalPrice } }, { new: true }).select({ "items._id": 0 })
                return res.send(existingCart)
            }
            existingCart = await cartModel.findOneAndUpdate({ _id: cartId, "items.productId": productId }, { $inc: { "items.$.quantity": 1 }, $set: { totalPrice: totalPrice } }, { new: true }).select({ "items._id": 0 })
            res.status(201).send({ status: true, message: "Success", data: existingCart })

        }
    }
    catch (err) {
        return res.status(500).send({ staus: false, message: err.message })
    }
}

exports.updateCart = async function (req, res) {
    try {

        const userId = req.params.userId
        if(!validObjectId(userId)) return res.status(400).send({status:false,message:"Please provide valid user id 🥵"})
        let loggedUser = req.token.userId
        if (userId !== loggedUser) return res.status(403).send({ status: false, message: "Unauthorized access" })
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

exports.getCart = async function (req, res) {
    try {
        let userId = req.params.userId;

        if (userId) {
            if (!validObjectId(userId))
                return res.status(400).send({ status: false, msg: "wrong userId" });
        }
        let loggedUser = req.token.userId
        if (userId !== loggedUser) return res.status(403).send({ status: false, message: "Unauthorized access" })

        let checkUserId = await userModel.findOne({ _id: userId });
        if (!checkUserId) {
            return res.status(404).send({ status: false, message: "no user details found" });
        }

        let getData = await cartModel.findOne({ userId });
        if (getData.items.length == 0)
            return res.status(400).send({ status: false, message: "items details not found" });

        if (!getData) {
            return res.status(404).send({ status: false, message: "cart not found" });
        }
        res.status(200).send({ status: true, message: "cart successfully", data: getData });
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

exports.deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        if (!validObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid user id" })

        const loggedUserId = req.token.userId;
        if (userId != loggedUserId) return res.status(403).send({ status: false, message: "unauthorized access" })
        
        const userExist = await userModel.findById(userId)
        if (!userExist) return res.status(404).send({ status: false, message: "No user exist with this user id" })

        const updateObj = { items: [], totalPrice: 0, totalItems: 0 };

        const cartExistAndUpdate = await cartModel.findOneAndUpdate({ userId: userId }, updateObj, { new: true })
        if (!cartExistAndUpdate) return res.status(404).send({ status: false, message: "No cart exist of this user" })


        return res.status(204).send({ status: true, message: "Success", data: cartExistAndUpdate })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}