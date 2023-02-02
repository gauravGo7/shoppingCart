const productModel = require("../models/productModel")
const {validObjectId } = require("../validator/validation")

exports.deleteProduct = async function (req, res) {
    try {
      let productId = req.params.productId
      if (!validObjectId(productId)) return res.status(400).send({ status: false, message: 'ProductId is not Valid' })
      
      let productData = await productModel.findOne({_id:productId,isDeleted:false})
      if (!productData) return res.status(404).send({ status: false, message: "Product Not Found" })
      
      await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
      return res.status(200).send({ status: true, message: "Product Deleted Successfully" })
    }
    catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }



