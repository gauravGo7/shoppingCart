const { Query } = require("mongoose")
const uploadFile = require("../aws/aws")
const productModel = require("../models/productModel")
const { validObjectId, validName, isValidPrice, isValidNum, isValidImg } = require("../validator/validation")

exports.createProduct = async (req, res) => {
    try {
        let data = req.body
        let file = req.files

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = data


        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "No data found from body! You need to put the Mandatory Fields. " });

        if (!title) return res.status(400).send({ status: false, messsage: "Title is mandatory" })
        if (!validName(title)) return res.status(400).send({ status: false, message: "Title can only contain alphabets" })

        if (!description) return res.status(400).send({ status: false, messsage: "Description is mandatory" })
        if (!validName(description)) return res.status(400).send({ status: false, message: "Description can only contain alphabets" })

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

        const productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) return res.status(404).send({ status: false, message: "No product found with this product id" })

        return res.status(200).send({ status: true, message: "Success", data: productData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


exports.getProduct = async (req, res) => {
    try {
        let query = req.query

        let { size, name, priceGreaterThan, priceLessThan } = query
        let queryObj = {};

        queryObj.isDeleted = false;

        if (size) {
            queryObj.availableSizes = size;
        }
        if (name) {
            queryObj.title = { "$regex": name, "$options": "i" }
        }
        if (priceGreaterThan && priceLessThan) {
            queryObj.price = { $gt: priceGreaterThan, $lt: priceLessThan }
        }
        else if (priceGreaterThan) {
            queryObj.price = { $gt: priceGreaterThan }
        }
        else if (priceLessThan) {
            queryObj.price = { $lt: priceLessThan }
        }

        let productData = await productModel.find(queryObj).sort({ price: 1 })
        if (productData.length == 0) return res.status(404).send({ status: false, message: "No product data found" })
        return res.status(200).send({ status: true, msg: "Success", data: productData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

exports.updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!validObjectId(productId)) return res.status(400).send({ status: false, messaage: "Please Provide Valid Product Id" })

        const findProductId = await productModel.findById({ _id: productId, isDeleted: false })
        if (!findProductId) return res.status(400).send({ status: false, messaage: "Product not found" })

        let data = req.body
        let file = req.files

        if (!isValidBody(data) && (typeof (file) == "undefined")) return res.status(400).send({ status: false, message: "Please Provide Some Data in the body" })
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

        const updatedObj = {}
        if (title) {
            data.title = data.title.toLowerCase()
            if (!validValue(title)) return res.status(400).send({ status: false, message: "Title should be in String format" })
            let findtitle = await productModel.findOne({ title: data.title });
            if (findtitle) return res.status(400).send({ status: false, message: "Title already exists" })
            updatedObj.title = title
        }

        if (description) {
            if (!validValue(description)) return res.status(400).send({ status: false, message: "Description should be in String format" })
            updatedObj.description = description
        }

        if (price) {
            if (!isValidPrice.test(price)) return res.status(400).send({ status: false, message: "Price should be in Number" })
            updatedObj.price = price
        }
        if (currencyId) {
            if (currencyId != "INR") return res.status(400).send({ status: false, message: "Only 'INR' CurrencyId is allowed" })
            updatedObj.currencyId = currencyId
        }

        if (currencyFormat) {
            if (currencyFormat != "₹") return res.status(400).send({ status: false, message: "Only '₹' Currency Symbol is allowed" })
            updatedObj.currencyFormat = currencyFormat
        }

        if (isFreeShipping) {
            if (isFreeShipping != "true" && isFreeShipping != "false") {
                return res.status(400).send({ status: false, message: "isFreeShipping is only accepted in Boolean Value like true or false" })
            }
            updatedObj.isFreeShipping = isFreeShipping
        }
        if (file && file.length > 0) {
            if (!isValidImg(file[0].originalname)) return res.status(400).send({ status: false, message: "Please provide image in jpg|gif|png|jpeg|jfif " })
            let url = await uploadFile(file[0]);
            updatedObj.productImage = url
        }

        if (style) {
            if (!validValue(style)) return res.status(400).send({ status: false, message: "style should be in String format" })
            updatedObj.style = style
        }

        if (availableSizes) {
            let size = availableSizes.replace(/\s+/g, "")//k
            let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            let present
            for (let i = 0; i < size.length; i++) {
                present = arr.includes(size)
            }
            if (!present) {
                return res.status(400).send({ status: false, message: "Enter a valid size S or XS or M or X or L or XXL or XL ", });
            }

            updatedObj['availableSizes'] = size
            
    
        }

        if (installments) {
            if (!isValidNum.test(installments)) return res.status(400).send({ status: false, message: "Installments should be in Number" })
            updatedObj.installments = installments
        }

        const productData = await productModel.findOneAndUpdate({ _id: productId }, { $set: updatedObj }, { new: true });

        return res.status(200).send({ status: true, message: "Success", data: productData });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
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