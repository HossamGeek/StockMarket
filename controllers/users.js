var express = require('express');
var router = express.Router();
var bodyparser = require('body-parser');
var midparse = bodyparser.urlencoded();
var fs = require('fs');

var mongoose = require('mongoose');

require("../model/assets");
require("../model/openusers");
require("../model/closeusers");


var AssetsModel = mongoose.model('assets');
var OpenUserModel = mongoose.model('openusers');
var ClosedUserModel = mongoose.model('closeusers');



//save stock without purchase

router.post('/save',midparse,function (req,res) {
    var assetid = req.body.assetid;
    var username = req.body.username;
    var purchase = req.body.purchase;

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


        AssetsModel.findOne({ _id:mongoose.Types.ObjectId(assetid),status:1 }, function(err, asset) {
            if (err) {
                console.log(err);
                return;
            }else {
                if(asset === null){
                    res.json({err:'Assets Not Found'});

                }else{
                    var numberofstock = parseInt( purchase /asset.high );
                    var purchaseprice = parseInt(numberofstock * asset.high);

                    OpenUserModel.findOne({ username: username,assetid:assetid }, function(err, user) {
                        if (err) {
                            console.log(err);
                            return;
                        }else if (user) {
                            return res.status(400).json(
                                [{ msg: 'The username and asset you have entered is already associated with another account.' }]
                            );
                        }else {
                        user = new OpenUserModel({
                            assetid : assetid,
                            username :username,
                            purchase :purchase,
                            numberofstock:numberofstock,
                            purchaseprice: purchaseprice,
                            status:1,
                            date:new Date()
                        });
                        user.save(function(err) {
                            if(err){
                                console.log(err);
                                return;
                            }
                            res.json({users:user});

                        });
                        }
                    });
                }
            }
        });

    }


});

router.post('/buy',midparse,function (req,res) {
    var assetid = req.body.assetid;
    var username = req.body.username;
    var purchase = req.body.purchase;

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

        AssetsModel.findOne({ _id:mongoose.Types.ObjectId(assetid),status:1 }, function(err, asset) {
            if (err) {
                console.log(err);
                return;
            }else {
                if(asset === null){
                    res.json({err:'Assets Not Found'});

                }else{
                    var numberofstock = parseInt( purchase /asset.high );
                    var purchaseprice = parseInt(numberofstock * asset.high);

                    ClosedUserModel.findOne({ username: username }, function(err, user) {
                        if (err) {
                            console.log(err);
                            return;
                        }else if (user) {
                            return res.status(400).json(
                                [{ msg: 'The username you have entered is already associated with another account.' }]
                            );
                        }
                        user = new ClosedUserModel({
                            assetid : assetid,
                            username :username,
                            purchase :purchaseprice,
                            status:1,
                            date:new Date()
                        });
                        user.save(function(err) {
                            if(err){
                                console.log(err);
                                return;
                            }
                            res.json({users:user});

                        });
                    });
                }
            }
        });


    }

});




/** get status of all user**/


router.get('/allusers',midparse,function (req,res) {
        OpenUserModel.find({status: 1}, function (err, users) {

            if (err) {
                console.log(err);
                return;
            } else {
                AssetsModel.populate(users, {
                    path: "assetid",
                    select: ["name", "open", "high", "low"]
                }, function (err, users) {

                    var data = []
                    for(var x = 0; x <= users.length -1;x++){
                       var pricenow = parseInt( users[x].numberofstock * (users[x].assetid.high));

                        data.push({
                            username: users[x].username, asset: users[x].assetid.name, firstpurchase: users[x].purchase,
                            purchaseprice : users[x].purchaseprice,
                            numberofstock: users[x].numberofstock,
                            pricenow : pricenow
                        });

                        if(x === users.length-1 ){
                            res.json({users:data});

                        }

                    }


                });
            }

        });

});







/** status of user before 2:00pm**/


router.get('/useropen/:username',midparse,function (req,res) {
    var username = req.params.username;

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
    }else {

        OpenUserModel.find({username: username, status: 1}, function (err, users) {

            if (err) {
                console.log(err);
                return;
            } else {
                if (users === null || users.length <= 0) {
                    return res.json({err : "user not found"});
                } else {

                    AssetsModel.populate(users, {
                        path: "assetid",
                        select: ["name", "open", "high", "low"]
                    }, function (err, users) {

                        var pricenow = parseInt( users[0].numberofstock * (users[0].assetid.high));

                        res.json({
                            username: users[0].username, asset: users[0].assetid.name, firstpurchase: users[0].purchase,
                            purchaseprice : users[0].purchaseprice,
                            numberofstock: users[0].numberofstock,
                            pricenow : pricenow
                        });
                    });
                }
            }
        });

    }
});

/** status of user after 2:00pm**/


router.get('/userclose/:username',midparse,function (req,res) {
    var username = req.params.username;

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

        ClosedUserModel.find({username: username, status: 1}, function (err, users) {

            if (err) {
                console.log(err);
                return;
            } else {
                if (users === null || users.length <= 0) {
                    return res.json({err:"user not found "});
                } else {


                    AssetsModel.populate(users, {
                        path: "assetid",
                        select: ["name", "open", "high", "low"]
                    }, function (err, users) {
                        var numberofstock = parseInt( (users[0].purchase) /(users[0].assetid.high) );
                        var purchaseprice = parseInt(numberofstock * (users[0].assetid.high));


                        var pricenow = parseInt( users[0].numberofstock * (users[0].assetid.high));

                        res.json({
                            username: users[0].username, asset: users[0].assetid.name, purchase: users[0].purchase,
                            numberofstock: users[0].numberofstock,
                            pricenow : purchaseprice,msg:"stock Market Closed"
                        });
                    });
                }
            }
        });


    }else {

        ClosedUserModel.find({username: username, status: 1}, function (err, users) {

            if (err) {
                console.log(err);
                return;
            } else {
                if (users === null || users.length <= 0) {
                    return res.json({err:"user not found "});
                } else {

                    AssetsModel.populate(users, {
                        path: "assetid",
                        select: ["name", "open", "high", "low"]
                    }, function (err, users) {
                           var numberofstock = parseInt( (users[0].purchase) /(users[0].assetid.high) );
                                var purchaseprice = parseInt(numberofstock * (users[0].assetid.high));


                                var pricenow = parseInt( users[0].numberofstock * (users[0].assetid.high));

                                res.json({
                                    username: users[0].username, asset: users[0].assetid.name, purchase: users[0].purchase,
                                    numberofstock: users[0].numberofstock,
                                    pricenow : purchaseprice,msg:"stock Market open"
                                });
                    });
                }
            }
        });

    }
});






/**Edit Open**/
router.put('/editopen/:id',midparse,function (req,res) {
    var userid =req.params.id;
    var assetid = req.body.assetid;
    var username = req.body.username;
    var purchase = req.body.purchase;

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


        AssetsModel.findOne({ _id:mongoose.Types.ObjectId(assetid),status:1 }, function(err, asset) {
            if (err) {
                console.log(err);
                return;
            }else {
                if(asset === null){
                    res.json({err:'Assets Not Found'});

                }else{
                    var numberofstock = parseInt( purchase /asset.high );
                    var purchaseprice = parseInt(numberofstock * asset.high);

                    OpenUserModel.update({ _id:mongoose.Types.ObjectId(userid), username: username, assetid : assetid },{$set:{
                        purchase :purchase,
                        numberofstock:numberofstock,
                        purchaseprice: purchaseprice
                    }}, function(err, user) {
                        if (err) {
                            console.log(err);
                            return;
                        }else {

                            res.json({user:'userupdated'});
                        }
                    });
                }
            }
        });

    }


});



/**Edit close**/
router.put('/editclose/:id',midparse,function (req,res) {
    var userid =req.params.id;
    var assetid = req.body.assetid;
    var username = req.body.username;
    var purchase = req.body.purchase;

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


        AssetsModel.findOne({ _id:mongoose.Types.ObjectId(assetid),status:1 }, function(err, asset) {
            if (err) {
                console.log(err);
                return;
            }else {
                if(asset === null){
                    res.json({err:'Assets Not Found'});

                }else{
                    var numberofstock = parseInt( purchase /asset.high );
                    var purchaseprice = parseInt(numberofstock * asset.high);

                    ClosedUserModel.update({ _id:mongoose.Types.ObjectId(userid), username: username, assetid : assetid },{$set:{
                        username :username,
                        purchase :purchaseprice,
                    }}, function(err, user) {
                        if (err) {
                            console.log(err);
                            return;
                        }else {

                            res.json({user:'userupdated'});
                        }
                    });
                }
            }
        });

    }

});


/**delete all session of openuser**/

router.delete('/opensession',midparse,function (req,res) {

    OpenUserModel.remove(function (err,result) {
        if(err){
          console.log(err);
          return;
        }else {
            res.json({msg:"session Deleted"});
        }
    })
});

/*


// or deleted daily in 2:00pm


var today = new Date();

var todaytime = today.toLocaleString('en-US', { hour: 'numeric', hour12: false });

if(todaytime >= 14 || todaytime < 9){
    OpenUserModel.remove(function (err,result) {
        if(err){
            console.log(err);
            return;
        }else {
            res.json({msg:"session Deleted"});
        }
    });
}
*/




module.exports = router;

