const { default: mongoose } = require("mongoose");

const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"A tour name is required"],
        unique:true
    },
    rating:{
        type:Number,
        required:[true,"A rating is required"],
        default:3.0
    },
    price:{
        type:Number,
        required:[true,"A price is required"]
    }
});

const Tour = mongoose.model('Tour',tourSchema);


module.exports = Tour;