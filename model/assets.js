var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var assets = new Schema({
    _id: { type: Schema.ObjectId, auto: true },
    name: String,
    open:Number,
    high:Number,
    low:Number,
    close:Number,
    status:0,
    date:Date,
});

//Register Model..
mongoose.model("assets",assets);
