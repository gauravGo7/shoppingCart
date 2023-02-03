const { Query } = require("mongoose")
const uploadFile = require("../aws/aws")
const productModel = require("../models/productModel")
const { validObjectId, validName, isValidPrice, isValidNum } = require("../validator/validation")

exports.createProduct = async (req, res) => {
    try {
        let data = req.body
        let file = req.files

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = data


        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "No data found from body! You need to put the Mandatory Fields. " });

        if (!title) return res.status(400).send({ status: false, messsage: "Title is mandatory" })
        if (!validName(title)) return res.status(400).send({ status: false, message: "Title can only contain alphabets" })

        if (!description) return res.status(400).send({ status: false, messsage: "description is mandatory" })
        if (!validName(description)) return res.status(400).send({ status: false, message: "Desc can only contain alphabets" })

        if (!price) return res.status(400).send({ status: false, messsage: "Price is mandatory" })
        if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "Price can only contain numbers" })

        if (!currencyId) return res.status(400).send({ status: false, messsage: "CurrencyId is mandatory" })

        if (!currencyFormat) return res.status(400).send({ status: false, messsage: "CurrencyFormat is mandatory" })

        //if(!productImage) return res.status(400).send({status:false, messsage:"Product image is mandatory"})
        if (!style) return res.status(400).send({ status: false, messsage: "Style is mandatory" })
        if (!validName(style)) return res.status(400).send({ status: false, message: "style can only contain alphabets" })

        if (!availableSizes) return res.status(400).send({ status: false, messsage: "Size is mandatory" })

        if (!installments) return res.status(400).send({ status: false, messsage: "Installment is mandatory" })
        if (!isValidNum(installments)) return res.status(400).send({ status: false, message: "Installment can only contain numbers" })


        const isDuplicateTitle = await productModel.findOne({ title: title });
        if (isDuplicateTitle) {
            return res.status(400).send({ status: false, message: "Title Already Exists, Please Enter Another Title!" });
        }

        let url = await uploadFile(file[0])
        const productData = {
            title: title.trim(), description: description, price: price, currencyId: currencyId, currencyFormat: currencyFormat,
            style: style, availableSizes: availableSizes, installments: installments, productImage: url
        }
        let createProduct = await productModel.create(productData)
        return res.status(201).send({ status: true, message: "Success", data: createProduct })

    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}


exports.getProductById = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!validObjectId(productId)) return res.status(400).send({ status: false, message: "Please provide a valid product id" })

        const productData = productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) return res.status(404).send({ status: false, message: "No product found with this product id" })

        return res.status(200).send({ status: true, message: "Success", data: productData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

exports.deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!validObjectId(productId)) return res.status(400).send({ status: false, message: 'ProductId is not Valid' })

        let productData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } })
        if (!productData) return res.status(404).send({ status: false, message: "Product Not Found" })

        return res.status(200).send({ status: true, message: "Product Deleted Successfully" })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

exports.getProduct = async (req, res) => {
    let query = req.query
    let { priceGreaterThan, priceLessThan, ...rest } = query
    if (Object.keys(req.query).length === 0) {
        let data = await productModel.find({ isDeleted: false })
        return res.send("adarsh")
    }
    else {
        if (!query.size && !query.name && !query.priceGreaterThan && query.priceLessThan) return res.status(400).send({ status: false, messaage: "please give suitable query" })

        // console.log("anjali")
        if (priceGreaterThan && priceLessThan) {
            let data = await productModel.find({ price: { $gt: priceGreaterThan, $lt: priceLessThan }, ...rest, isDeleted: false }).sort({ price: 1 })
            return res.send("manisha")
        }
        else if (priceGreaterThan) {
            let data = await productModel.find({ price: { $gt: priceGreaterThan }, ...rest, isDeleted: false })
            return res.send("kullu")
        }
        else if (priceLessThan) {
            let data = await productModel.find({ price: { $lt: priceLessThan }, ...rest, isDeleted: false })
            return res.send("preeti")
        }
        let data = await productModel.find({ ...rest, isDeleted: false })
        return res.status(200).send({ status: true, message: "Success", data: data })
    }
}

exports.updateProduct = async function(req,res){
    let productId = req.params.productId
    if(!validObjectId(productId)) return res.status(400).send({status:false, messaage: "Please Provide Valid Product Id"})

    const findProductId = await productModel.findById({_id: productId, isDeleted: false})
    if(!findProductId) return res.status(400).send({status: false, messaage: "Product not found"})

    let data = req.body
    let file = req.file
}