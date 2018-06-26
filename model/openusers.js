var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var openusers = new Schema({
    _id: { type: Schema.ObjectId, auto: true },
    username:String,
    assetid:{
        type:String,
        ref:"assets"
    },
    purchase:Number,
    purchaseprice:Number,
    numberofstock:Number,
    date:Date,
    status:Number
});

//Register Model..
mongoose.model("openusers",openusers);
