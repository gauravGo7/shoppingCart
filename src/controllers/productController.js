const { Query } = require("mongoose")
const productModel = require("../models/productModel")
const { validObjectId } = require("../validator/validation")

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

        let productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) return res.status(404).send({ status: false, message: "Product Not Found" })

        await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        return res.status(200).send({ status: true, message: "Product Deleted Successfully" })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

exports.getProduct=async(req,res)=> {
let query=req.query
let {priceGreaterThan, priceLessThan, ...rest} = query
if(Object.keys(req.query).length===0){
  let data = await productModel.find({isDeleted:false})
  return res.send("adarsh")
}
else{
   if(!query.size && !query.name && !query.priceGreaterThan && query.priceLessThan)  return res.status(400).send({status:false, messaage: "please give suitable query"})

    // console.log("anjali")
    if(priceGreaterThan && priceLessThan){
    let data= await productModel.find({price:{$gt:priceGreaterThan, $lt:priceLessThan}, ...rest, isDeleted:false}).sort({price:1})
    return res.send("manisha")
    }
    else if(priceGreaterThan){
      let data = await productModel.find({price:{$gt : priceGreaterThan},...rest, isDeleted:false})
           return res.send("kullu")
    }
    else if(priceLessThan){
        let data = await productModel.find({price : {$lt :priceLessThan}, ...rest, isDeleted:false})
        return res.send("preeti")
    }
    let data = await productModel.find({...rest, isDeleted:false})
    return res.status(200).send({status:true, message: "Success",data:data})
}
}

