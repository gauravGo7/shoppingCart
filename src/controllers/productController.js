const { Query } = require("mongoose")
const uploadFile = require("../aws/aws")
const productModel = require("../models/productModel")
const { validObjectId, validValue, validName, isValidAvailableSizes,isValidBody, isValidPrice, isValidNum, isValidImg, isValidProdName, isValidInstallment } = require("../validator/validation")

exports.createProduct = async (req, res) => {

    try {
        let data = req.body
        let files = req.files

        //===================== Destructuring User Body Data =====================//
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = data

        //===================== Checking Mandotory Field =====================//
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "No data found from body! You need to put the Mandatory Fields (i.e. title, description, price, currencyId, currencyFormat, productImage). " });


        //===================== Create a Object of Product =====================//
        let obj = {}

        //===================== Validation of title =====================//
        if (!validValue(title)) { return res.status(400).send({ status: false, message: "Please enter title!" }) }
        if (!isValidProdName(title)) { return res.status(400).send({ status: false, message: "Please mention valid title In Body!" }) }
        obj.title = title

        //===================== Validation of Description =====================//
        if (!validValue(description)) return res.status(400).send({ status: false, message: "Please enter description!" });
        obj.description = description

        //===================== Validation of Price =====================//
        if (!validValue(price)) return res.status(400).send({ status: false, message: "Please enter price!" });
        if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "Please valid valid price In Body!" });
        obj.price = price

        //===================== Validation of CurrencyId =====================//
        if (currencyId || currencyId == '') {
            if (!isValidBody(currencyId)) return res.status(400).send({ status: false, message: "Please enter CurrencyId!" });
            if (currencyId != 'INR') return res.status(400).send({ status: false, message: "CurrencyId must be 'INR'!" });
            obj.currencyId = currencyId
        }

        //===================== Validation of CurrencyFormat =====================//
        // if (currencyFormat || currencyFormat == '') {
        //     if (!validValue(currencyFormat)) return res.status(400).send({ status: false, message: "Please enter currencyFormat!" });
        //     if (currencyFormat != '₹') return res.status(400).send({ status: false, message: "Currency Format must be '₹'!" });
        //     obj.currencyFormat = currencyFormat
        // }

        //===================== Validation of isFreeShipping =====================//
        if (isFreeShipping) {
            if (!validValue(isFreeShipping)) return res.status(400).send({ status: false, message: "Please enter value of Free Shipping!" });
            if (isFreeShipping !== 'true' && isFreeShipping !== 'false') return res.status(400).send({ status: false, message: "Please valid value of Free shipping!" });
            obj.isFreeShipping = isFreeShipping
        }


        //===================== Validation of Style =====================//
        if (style) {
            if (!validValue(style)) return res.status(400).send({ status: false, message: "Please enter style!" });
            if (!validName(style)) return res.status(400).send({ status: false, message: "Please valid style!" });
            obj.style = style
        }

        //===================== Validation of AvailableSizes =====================//
        if (!validValue(availableSizes)) return res.status(400).send({ status: false, message: "Please enter Size!" });
        availableSizes = availableSizes.split(',').map((item) => item.trim().toUpperCase())
        for (let i = 0; i < availableSizes.length; i++) {
            if (!isValidAvailableSizes(availableSizes[i])) return res.status(400).send({ status: false, message: "Please mention valid Size!" });
        }
        obj.availableSizes = availableSizes


        //===================== Validation of Installments =====================//
        if (installments || installments == '') {
            if (!validValue(installments)) return res.status(400).send({ status: false, message: "Please enter installments!" });
            if (!isValidInstallment(installments)) return res.status(400).send({ status: false, message: "Provide valid Installments number!" });
            obj.installments = installments
        }

        //===================== Fetching Title of Product from DB and Checking Duplicate Title is Present or Not =====================//
        const isDuplicateTitle = await productModel.findOne({ title: title });
        if (isDuplicateTitle) {
            return res.status(400).send({ status: false, message: "Title is Already Exists, Please Enter Another Title!" });
        }
        
        //===================== Checking the ProductImage is present or not and Validate the ProductImage =====================//
        if (files && files.length > 0) {
            if (files.length > 1) return res.status(400).send({ status: false, message: "You can't enter more than one file for Create!" })
            if (!isValidImg(files[0]['originalname'])) { return res.status(400).send({ status: false, message: "You have to put only Image." }) }
            let uploadedFileURL = await uploadFile(files[0])
            obj.productImage = uploadedFileURL
        } else {
            return res.status(400).send({ message: "Product Image is Mandatory! Please input image of the Product." })
        }

        //x===================== Final Creation of Product =====================x//
        let createProduct = await productModel.create(obj)

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

        let { size, name, priceGreaterThan, priceLessThan,priceSort } = query
        let queryObj = {};

        queryObj.isDeleted = false;

        if (size) {
            queryObj.availableSizes = size.toUpperCase();
            if (!isValidAvailableSizes(queryObj.availableSizes)) return res.status(400).send({ status: false, message: "Please provide valid Size!" });
        }
        if (name) {
            queryObj.title = { "$regex": name, "$options": "i" }
        }
        if (priceGreaterThan && priceLessThan) {
            let price=(Number(priceGreaterThan) && Number(priceLessThan))
            if(!price) return res.status(400).send({status:false,message:"please provide number in priceGreaterThan and priceLessThan"})
            queryObj.price = { $gt: priceGreaterThan, $lt: priceLessThan }
        }
        else if (priceGreaterThan) {
            let price=Number(priceGreaterThan)
            if(!price) return res.status(400).send({status:false,message:"please provide number in priceGreaterThan"})
            queryObj.price = { $gt: priceGreaterThan }
        }
        else if (priceLessThan) {
            let price=Number(priceLessThan)
            if(!price) return res.status(400).send({status:false,message:"please provide number in priceLessThan"})
            queryObj.price = { $lt: priceLessThan }
        }

        if(priceSort){
            priceSort=Number(priceSort);
            if(!priceSort ||(priceSort!=1 && priceSort!=-1)) return res.status(400).send({status:false,message:"please provide valid priceShort 1 or -1"})
        }
        else{
            priceSort=1
        }

        let productData = await productModel.find(queryObj).sort({ price: priceSort})
        if (productData.length == 0) return res.status(404).send({ status: false, message: "No product data found" })
        return res.status(200).send({ status: true, message: "Success", data: productData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

exports.updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!validObjectId(productId)) return res.status(400).send({ status: false, messaage: "Please Provide Valid Product Id" })

        const findProductId = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProductId) return res.status(400).send({ status: false, messaage: "Product not found" })

        let data = req.body
        let file = req.files

        if (!isValidBody(data) && (typeof (file) == "undefined")) return res.status(400).send({ status: false, message: "Please Provide Some Data in the body" })
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = data

        const updatedObj = {}
        if (title) {
            data.title = data.title.toLowerCase()
            if(!validName(title)) return res.status(400).send({status:false,message:"please provide valid title"})
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
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "Price should be in Number" })
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
            let size = availableSizes.split(",")
            for (let i = 0; i < size.length; i++) {
                size[i]=size[i].toUpperCase()
                if (!isValidAvailableSizes(size[i]))return res.status(400).send({ status: false, message: "Enter a valid size S or XS or M or X or L or XXL or XL "});
            }
            availableSizes=size
        }

        if (installments) {
            if (!isValidNum(installments)) return res.status(400).send({ status: false, message: "Installments should be in Number" })
            updatedObj.installments = installments
        }

        const productData = await productModel.findOneAndUpdate({ _id: productId }, { $set: updatedObj,$push:{availableSizes:availableSizes}}, { new: true });

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