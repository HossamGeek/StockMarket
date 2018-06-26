var express = require('express');
var router = express.Router();
var bodyparser = require('body-parser');
var midparse = bodyparser.urlencoded();
var fs = require('fs');

var mongoose = require('mongoose');

require("../model/assets");


var AssetsModel = mongoose.model('assets');



router.get("/",midparse,function (req,res) {
    res.redirct('/assests/allassets');
});



/** get all assets**/
router.get("/allassets",midparse,function (req,res) {


    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    }
    if(mm<10) {
        mm = '0'+mm
    }
    var todaydate = mm + '/' + dd + '/' + yyyy;

    var todaytime = today.toLocaleString('en-US', { hour: 'numeric', hour12: false });



        AssetsModel.find({status:1}, function(err, asset) {
        if (err) {
            console.log(err);
            return;
        }else{
            if(asset === null){
                res.json({err:'Assets Not Found'});

            }else{
                if(todaytime >= 14 || todaytime < 9){
                        for (var x = 0;x <= asset.length-1 ;x++){
                            AssetsModel.update({_id:mongoose.Types.ObjectId(asset[x]._id)},{$set:{
                                close:asset[x].high
                            }},function (err,asset) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                            });
                            if(x >= asset.length-1){
                                AssetsModel.find({status:1}, function(err, asset) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    res.json({assets:asset,status:"Stock Market Closed"});
                                });
                        }

                    }
                }else {
                    res.json({assets:asset,status:"Stock Market open"});
                }
        }
    }
    });

});

/**Add Assets**/

router.post("/add",midparse,function (req,res) {
    var name = req.body.name;
    var open = req.body.open;
    var high = req.body.high;
    var low = req.body.low;

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    }
    if(mm<10) {
        mm = '0'+mm
    }
    var todaydate = mm + '/' + dd + '/' + yyyy;

    var todaytime = today.toLocaleString('en-US', { hour: 'numeric', hour12: false });

    if(todaytime >= 14 || todaytime < 9){
        console.log("Closed");
        res.json({msg:"stock Market closed"});
    }else{

    AssetsModel.findOne({ name: name }, function(err, asset) {
        if (err) {
            console.log(err);
            return;
        }else if (asset) {
            return res.status(400).json(
                [{ msg: 'The name assest you have entered is already associated with another account.' }]
            );
        }
        asset = new AssetsModel({
            name: name,
            open: open,
            high : high,
            low: low,
            close: 0,
            status:1,
            date:new Date()
        });
        asset.save(function(err) {
            if(err){
                console.log(err);
                return;
            }
            res.json({'assets':asset});

        });
    });
    }

});




/**
 * get asset data
 * **/

router.get("/asset/:id",midparse,function (req,res) {
    var id = req.params.id;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    var todaydate = mm + '/' + dd + '/' + yyyy;

    var todaytime = today.toLocaleString('en-US', {hour: 'numeric', hour12: false});


    AssetsModel.findOne({_id: mongoose.Types.ObjectId(id), status: 1}, function (err, asset) {
        if (err) {
            console.log(err);
            return;
        } else {
            if (asset === null) {
                res.json({err: 'Assets Not Found'});

            } else {
                if (todaytime >= 14 || todaytime < 9) {
                    AssetsModel.update({_id: mongoose.Types.ObjectId(asset._id)}, {
                        $set: {
                            close: asset.high
                        }
                    }, function (err, asset) {
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            AssetsModel.find({_id: mongoose.Types.ObjectId(id), status: 1}, function (err, asset) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                res.json({assets: asset, status: "Stock Market Closed"});
                            });
                        }
                    });

                } else {

                    res.json({assets: asset, status: "Stock Market Open"});

                }

            }
        }


    });


});

/**Edit asset**/
/**
 * update unitl 2:00 pm update{name,open,high,low}
 * update after 2:00 pm update{close}
 * **/

router.put("/edit/:id",midparse,function (req,res) {
    var id = req.params.id;
    var open = req.body.open;
    var high = req.body.high;
    var low = req.body.low;
    var close = req.body.close;

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    }
    if(mm<10) {
        mm = '0'+mm
    }
    var todaydate = mm + '/' + dd + '/' + yyyy;

    var todaytime = today.toLocaleString('en-US', { hour: 'numeric', hour12: false });

    if(todaytime >= 14 || todaytime < 9){
        AssetsModel.findOne({ _id:mongoose.Types.ObjectId(id) }, function(err, asset) {
            if (err) {
                console.log(err);
                return;
            }else {
                AssetsModel.update({_id:mongoose.Types.ObjectId(id)},{$set:{
                        close:close
                }},function (err,asset) {
                    if (err) {
                        console.log(err);
                        return;
                    }else {
                        AssetsModel.find({},function (err,assets) {
                            res.json({assets:assets,status:"Stock Market close"});
                        });
                    }
                });
            }
        });
        res.json({status:"Stock Market close"});
    }else{
        AssetsModel.findOne({ _id:mongoose.Types.ObjectId(id) }, function(err, asset) {
            if (err) {
                console.log(err);
                return;
            }else {
                AssetsModel.update({_id:mongoose.Types.ObjectId(id)},{$set:{
                    open: open,
                    high : high,
                    low: low
                }},function (err,asset) {
                    if (err) {
                        console.log(err);
                        return;
                    }else {
                        AssetsModel.find({},function (err,assets) {
                           res.json({assets:assets,status:"open"});
                        });
                    }
                });
            }
        });
    }

});



/*
/!**Remove asset**!/

router.put('/delete/:id',midparse,function (req,res) {
    var id = req.params.id;
    var user =req.body.user;
    var password =req.body.password;
    if(user == "admin" && password == "admin"){

        AssetsModel.findOne({ _id:mongoose.Types.ObjectId(id) }, function(err, asset) {
            if (err) {
                console.log(err);
                return;
            }else {
                AssetsModel.update({_id:mongoose.Types.ObjectId(id)},{$set:{
                    status:0
                }},function (err,asset) {
                    if (err) {
                        console.log(err);
                        return;
                    }else {
                        res.json({mss:"asset deleted"});
                    }
                });
            }
        });
    }
});


/!** active asset**!/

router.put('/activeasset/:id',midparse,function (req,res) {
    var id = req.params.id;
    var user =req.body.user;
    var password =req.body.password;

    if(user == "admin" && password == "admin"){

    AssetsModel.findOne({ _id:mongoose.Types.ObjectId(id) }, function(err, asset) {
        if (err) {
            console.log(err);
            return;
        }else {
            AssetsModel.update({_id:mongoose.Types.ObjectId(id)},{$set:{
                status:1
            }},function (err,asset) {
                if (err) {
                    console.log(err);
                    return;
                }else {
                    res.json({mss:"asset active"});
                }
            });
        }
    });
    }
});
*/


module.exports = router;

