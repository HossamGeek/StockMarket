var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var closeusers = new Schema({
    _id: { type: Schema.ObjectId, auto: true },
    username:String,
    assetid:{
        type:String,
        ref:"assets"
    },
    purchase:Number,
    date:Date,
    status:Number
});

//Register Model..
mongoose.model("closeusers",closeusers);
