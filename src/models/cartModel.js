const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema({
    userId: {
        types: ObjectId,
        ref: "User",
        required:true,
        unique: true,
        trim:true
    },
    items: [
        {
            productId: {
                types:ObjectId,
                ref:"ProductData",
                required:true,
                trim:true
            },
            quantity: {
                types:Number,
                required:true,
                min:1
            }
        }
    ],
    totalPrice: {
        types:Number,
        required:true
        },
    totalItems: {
        types:Number,
        required:true
    }
},{timestamps:true})

module.exports=mongoose.model("Cart",cartSchema)