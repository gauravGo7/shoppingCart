const { Query } = require("mongoose")
const productModel = require("../models/productModel")

exports.getProduct=async(req,res)=> {
let query=req.query
let {priceGreaterThan, priceLessThan, ...rest} = query
if(Object.keys(req.query).length===0){
  let data = await productModel.find({isDeleted:false})
  return res.send("adarsh")
}
else{
   // if(!query.size && !query.name && !query.priceGreaterThan && query.priceLessThan)  return res.status(400).send({status:false, messaage: "please give suitable query"})

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

