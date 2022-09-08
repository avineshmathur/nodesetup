var models = require('../models');
var express = require('express');
var router = express.Router();
var verifyToken = require('../middlewares/verifyToken');
var ImageUpload = require('../middlewares/ImageUpload');
var responseReturn = require('../middlewares/responseReturn');
var modelName = 'User';
var async = require("async");
var Sequelize = require('sequelize');
var sequelize = require('../config/db');
var bcrypt = require('bcrypt');
var moment = require('moment');

var multer = require('multer')
var multerS3 = require('multer-s3')
var aws = require('aws-sdk')
var path = require('path');
aws.config.update({
    secretAccessKey: '',
    accessKeyId: '',
    region: 'us-east-1'
});
var s3 = new aws.S3();

var data_freak = require('../config/data_freak');

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'findme-files',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            console.log('qqqqq');
            console.log(path.extname(file.originalname));
            console.log(file);

            cb(null, Object.assign({}, req.body));
//            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + path.extname(file.originalname))
        }
    })
})

var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    //apiKey: '', //nodejs
    apiKey: '', //live
    formatter: null         // 'gpx', 'string', ...
};
var geocoder = NodeGeocoder(options);

/**
 * @api {post} /api/users/login Request User Login
 * @apiName Login
 * @apiGroup User
 *
 * @apiParam {String} email required either one, email or mobile
 * @apiParam {String} mobile required either one, email or mobile
 * @apiParam {String} password required
 *
 */

router.post('/login', function (req, res, next) {

    ImageUpload.uploadFields(req, res, function (err) {
        if (err) {
            res.send({status: false, msg: err});
        } else {
            req.where = {$or: [{mobile: req.body.mobile}, {email: req.body.email}]};
            models[modelName].getFirstValues(req, function (results1) {

                if (results1 != null && bcrypt.compareSync(req.body.password, results1.password)) {

                    req.where = {id: results1.id};
                    models[modelName].generateToken(req, function (results2) {

                        if (results2 != null) {
                            req.returnStatus = 200;
                            req.returnObj = {status: true, token: results2, results: results1};
                            responseReturn.returnObj(req, res, function (err) {


                            });
                        }

                    });

                } else {
                    req.returnStatus = 200;
                    req.returnObj = {status: false, msg: 'Invalid credential'};
                    responseReturn.returnObj(req, res, function (err) {


                    });
                }

            });

        }
    });
});


/**
 * @api {get} api/users/signup Request User SignUp
 * @apiName SignUp
 * @apiGroup User
 *
 * @apiParam {String} email required
 * @apiParam {String} name optional
 * @apiParam {String} password required
 *
 */

router.post('/signup', function (req, res, next) {

    ImageUpload.uploadFields(req, res, function (err) {
        if (err) {
            res.send({status: false, msg: err});
        } else {

            var modelBuild = models[modelName].build(req.body);

            var errors = [];
            async.parallel([
                function (callback) {

                    modelBuild.validate().then(function (err) {
                        if (err != null) {
                            errors = errors.concat(err.errors);
                            callback(null, errors);
                        } else {
                            callback(null, errors);
                        }
                    });
                }

            ], function (err) {
                if (errors.length == 0) {
                    models[modelName].saveAllValues(req, function (results) {
                        if (results.status) {
                            req.where = {id: results.id};
                            models[modelName].generateToken(req, function (results2) {

                                if (results2 != null) {
                                    req.returnStatus = 200;
                                    req.returnObj = {status: true, token: results2, results: results};
                                    responseReturn.returnObj(req, res, function (err) {

                                    });
                                }
                            });
                        } else {
                            req.returnStatus = 200;
                            req.returnObj = {status: false, msg: 'save failed'};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        }
                    });
                } else {
                    console.log(errors[0]);
                    req.returnStatus = 200;
                    req.returnObj = {status: false, err: errors[0]};
                    responseReturn.returnObj(req, res, function (err) {

                    });
                }
            });
        }
    });
});


/**
 * @api {post} api/users/fb_login Request Facebook login
 * @apiName FaceBook Login
 * @apiGroup User
 *
 * @apiParam {String} email required 
 * @apiParam {String} fb_id required 
 * @apiParam {String} name optional
 *
 */

router.post('/fb_login', function (req, res, next) {

    ImageUpload.uploadFields(req, res, function (err) {
        if (err) {
            req.returnObj = {status: false, msg: err};
            responseReturn.returnObj(req, res, function (err) {

            });
        } else {

            var replacementsArr = [req.body.email];


            if (req.body.fb_id != '') {
                req.where_fb_id = {social_id: req.body.fb_id};
            }

            req.where = {email: req.body.email};
            models[modelName].getFirstValues(req, function (results) {
                if (results != null) {

                    req.where = {id: results.id};
                    models[modelName].generateToken(req, function (results2) {

                        if (results2 != null) {
                            req.returnStatus = 200;
                            req.returnObj = {status: true, token: results2, results: results};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        }
                    });

                } else {

                    if (req.body.fb_id != '') {
                        req.body.social_logins = {social_id: req.body.fb_id, social_type: 'facebook'};
                    }

                    models[modelName].saveAllValues(req, function (results) {
                        if (results.status) {

                            req.where = {id: results.id};
                            models[modelName].generateToken(req, function (results2) {

                                if (results2 != null) {
                                    req.returnStatus = 200;
                                    req.returnObj = {status: true, token: results2, results: results};
                                    responseReturn.returnObj(req, res, function (err) {

                                    });
                                }
                            });
                        } else {
                            req.returnStatus = 200;
                            req.returnObj = {status: false, msg: 'save failed'};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        }
                    });
                }
            });

        }
    });
});


/**
 * @api {post} api/users/fb_id_check Request Facebook Id check
 * @apiName fb_id_check
 * @apiGroup User
 *
 * @apiParam {String} fb_id required 
 *
 */

router.post('/fb_id_check', function (req, res, next) {

    ImageUpload.uploadFields(req, res, function (err) {
        if (err) {
            req.returnObj = {status: false, msg: err};
            responseReturn.returnObj(req, res, function (err) {

            });
        } else {

            var replacementsArr = [req.body.email];

            req.where = {social_id: req.body.fb_id};

            models['SocialLogin'].getFirstValues(req, function (results) {
                if (results != null) {

                    req.where = {id: results.user_id};
                    models[modelName].generateToken(req, function (results2) {
                        if (results2 != null) {
                            req.returnStatus = 200;
                            req.returnObj = {status: true, token: results2, is_exist: 1, results: results};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        }
                    });

                } else {

                    req.returnStatus = 200;
                    req.returnObj = {status: true, is_exist: 0};
                    responseReturn.returnObj(req, res, function (err) {

                    });
                }
            });

        }
    });
});


/**
 * @api {post} api/users/mobile_signup Request mobile signup
 * @apiName mobile signup
 * @apiGroup User
 *
 * @apiParam {String} name optional
 * @apiParam {String} email required either one email or mobile
 * @apiParam {String} mobile required 
 * @apiParam {String} fb_id optional 
 *
 */

router.post('/mobile_signup', function (req, res, next) {

    ImageUpload.uploadFields(req, res, function (err) {
        if (err) {
            req.returnObj = {status: false, msg: err};
            responseReturn.returnObj(req, res, function (err) {

            });
        } else {

            req.where = {$or: [{mobile: req.body.mobile}, {email: req.body.email}]};

            models[modelName].getFirstValues(req, function (results) {
                if (results) {

                    req.where = {id: results.id};
                    models[modelName].generateToken(req, function (results2) {

                        if (results2 != null) {
                            req.returnStatus = 200;
                            req.returnObj = {status: true, token: results2, results: results};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        }
                    });
                } else {
                    if (typeof req.body.fb_id != 'undefined' && req.body.fb_id != '') {
                        req.body.social_logins = {social_id: req.body.fb_id, social_type: 'facebook'};
                    }
                    models[modelName].saveAllValues(req, function (results) {
                        if (results.status) {
                            req.where = {id: results.id};
                            models[modelName].generateToken(req, function (results2) {

                                if (results2 != null) {
                                    req.returnStatus = 200;
                                    req.returnObj = {status: true, token: results2, results: results};
                                    responseReturn.returnObj(req, res, function (err) {

                                    });
                                }
                            });
                        } else {
                            req.returnStatus = 200;
                            req.returnObj = {status: false, msg: 'save failed'};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        }
                    });
                }

            });
        }
    });
});

/**
 * @api {post} /api/users/generate_token Generate Token
 * @apiName generate_token
 * @apiGroup User
 *
 * @apiParam {String} id required 
 *
 */

router.post('/generate_token', function (req, res, next) {

    ImageUpload.uploadFields(req, res, function (err) {
        if (err) {
            res.send({status: false, msg: err});
        } else {
            req.where = {id: req.body.id}
            models[modelName].generateToken(req, function (results1) {

                if (results1 != null) {
                    req.returnObj = {status: true, token: results1};
                    req.returnStatus = 200;
                    responseReturn.returnObj(req, res, function (err) {


                    });
                } else {
                    req.returnStatus = 400;
                    req.returnObj = {status: false, msg: 'Invalid credential'};
                    responseReturn.returnObj(req, res, function (err) {


                    });
                }

            });

        }
    });
});

/**
 * @api {get} api/users/save_steps Request User save_steps
 * @apiName save_steps
 * @apiGroup User
 *
 * @apiParam {String} fieldname  any field
 * @apiParam {String} value any value
 * @apiParam {String} token required
 * @apiParam {String} work optional
 * @apiParam {String} job optional
 * @apiParam {String} education optional
 *
 */

router.post('/save_steps', verifyToken.verify, function (req, res, next) {

    ImageUpload.uploadFields(req, res, function (err) {
        if (err) {
            res.send({status: false, msg: err});
        } else {


            req.where = {id: req.users.id};

            req.bodydata = {};
            if (typeof req.body.notification != 'undefined' && req.body.notification != '') {
                req.bodydata.notification = req.body.notification;
            }

            if (typeof req.body.gender != 'undefined' && req.body.gender != '') {
                req.bodydata.gender = req.body.gender;
            }
            if (typeof req.body.show_me_gender != 'undefined' && req.body.show_me_gender != '') {
                req.bodydata.show_me_gender = req.body.show_me_gender;
            }
            if (typeof req.body.height != 'undefined' && req.body.height != '') {
                req.bodydata.height = req.body.height;
            }
            if (typeof req.body.ethancity != 'undefined' && req.body.ethancity != '') {
                req.bodydata.ethancity = req.body.ethancity;
            }
            if (typeof req.body.kids != 'undefined' && req.body.kids != '') {
                req.bodydata.kids = req.body.kids;
            }
            if (typeof req.body.family != 'undefined' && req.body.family != '') {
                req.bodydata.family = req.body.family;
            }
            if (typeof req.body.work != 'undefined' && req.body.work != '') {
                req.bodydata.work = req.body.work;
            }
            if (typeof req.body.job != 'undefined' && req.body.job != '') {
                req.bodydata.job = req.body.job;
            }
            if (typeof req.body.education != 'undefined' && req.body.education != '') {
                req.bodydata.education = req.body.education;
            }
            if (typeof req.body.highest_attended != 'undefined' && req.body.highest_attended != '') {
                req.bodydata.highest_attended = req.body.highest_attended;
            }
            if (typeof req.body.religious != 'undefined' && req.body.religious != '') {
                req.bodydata.religious = req.body.religious;
            }
            if (typeof req.body.politics != 'undefined' && req.body.politics != '') {
                req.bodydata.politics = req.body.politics;
            }
            if (typeof req.body.drinking != 'undefined' && req.body.drinking != '') {
                req.bodydata.drinking = req.body.drinking;
            }
            if (typeof req.body.smoking != 'undefined' && req.body.smoking != '') {
                req.bodydata.smoking = req.body.smoking;
            }
            if (typeof req.body.drugs != 'undefined' && req.body.drugs != '') {
                req.bodydata.drugs = req.body.drugs;
            }
            if (typeof req.body.profile_img != 'undefined' && req.body.profile_img != '') {
                req.bodydata.profile_img = req.body.profile_img;
            }
            if (typeof req.body.profile_video != 'undefined' && req.body.profile_video != '') {
                req.bodydata.profile_video = req.body.profile_video;
            }
            if (typeof req.body.max_distance != 'undefined' && req.body.max_distance != '') {
                req.bodydata.max_distance = req.body.max_distance;
            }
            if (typeof req.body.age_range != 'undefined' && req.body.age_range != '') {
                req.bodydata.age_range = req.body.age_range;
            }


            if (typeof req.body.lat != 'undefined' && typeof req.body.lng != 'undefined' && req.body.lat != '' && req.body.lng != '') {
                req.bodydata.lat = req.body.lat;
                req.bodydata.lng = req.body.lng;

                geocoder.reverse({lat: req.body.lat, lon: req.body.lng})
                        .then(function (gres) {
                            console.log(gres[0]);
                            req.bodydata.location = gres[0].city;
                            req.bodydata.address = gres[0].formattedAddress.replace(/\s*\[no name],\s*/g, '');

//                            let point = {
//                                type: 'Point',
//                                coordinates: [req.body.lng, req.body.lat],
//                                crs: {type: 'name', properties: {name: 'EPSG:4326'}}
//                            }

                            req.body = req.bodydata;
//                            req.body.geolocationpoint = point;
                            models[modelName].updateAllValues(req, function (results) {
                                if (results.status) {
                                    req.returnObj = {status: true};
                                    req.returnStatus = 200;
                                    responseReturn.returnObj(req, res, function (err) {

                                    });
                                } else {
                                    req.returnStatus = 200;
                                    req.returnObj = {status: false, msg: 'Update failed'};
                                    responseReturn.returnObj(req, res, function (err) {

                                    });
                                }
                            });

                        })
                        .catch(function (err) {
                            console.log(err);
                        });

            } else {

                req.body = req.bodydata;
                models[modelName].updateAllValues(req, function (results) {
                    if (results.status) {
                        req.returnObj = {status: true};
                        req.returnStatus = 200;
                        responseReturn.returnObj(req, res, function (err) {

                        });
                    } else {
                        req.returnStatus = 200;
                        console.log(results.errors);
                        req.returnObj = {status: false, msg: 'Update failed'};
                        responseReturn.returnObj(req, res, function (err) {

                        });
                    }
                });

            }

        }
    });
});


/**
 * @api {get} api/users/prospects Request
 * @apiName prospects
 * @apiGroup User
 *
 * @apiParam {String} token required
 * @apiParam {String} type required (likeyou, youlike, visitors, passed, matches)
 *
 */

router.post('/prospects', verifyToken.verify, function (req, res, next) {

    ImageUpload.uploadFields(req, res, function (err) {
        if (err) {
            res.send({status: false, msg: err});
        } else {


            var userId = req.users.id;

            if (req.body.type && req.body.type == 'likeyou') {
                var modeTable = 'Like';
                req.where = {user_id: userId, type: 1};
                req.returnUserType = 'user1';
            }
            if (req.body.type && req.body.type == 'youlike') {
                var modeTable = 'Like';
                req.where = {by_user_id: userId, type: 1};
                req.returnUserType = 'user2';
            }
            if (req.body.type && req.body.type == 'visitors') {
                var modeTable = 'View';
                req.where = {user_id: userId};
                req.returnUserType = 'user1';
            }
            if (req.body.type && req.body.type == 'passed') {
                var modeTable = 'Like';
                req.where = {user_id: userId, type: 0};
                req.returnUserType = 'user1';
            }
            if (req.body.type && req.body.type == 'matches') {
                var modeTable = 'Matche';
                req.where = {$or: [{user_id_one: userId}, {user_id_two: userId}]};
//                req.returnUserType = 'user1';
            }
            req.attributesFieldsUser = ['id', 'name', 'profile_img', 'profile_video', 'location'];
            req.attributesFieldsMain = ['id', 'created_at'];
//            req.attributesFields = ['id', 'name', 'mobile', 'profile_img','profile_video'];
            models[modeTable].getAllValues(req, function (results) {
                if (results != null) {
                    req.returnObj = {status: true, results: results};
                    responseReturn.returnObj(req, res, function (err) {

                    });
                } else {
                    req.returnObj = {status: false, msg: 'save failed'};
                    responseReturn.returnObj(req, res, function (err) {

                    });
                }
            });
        }
    });
});

/**
 * @api {get} api/users/discover Request discover
 * @apiName discover
 * @apiGroup User
 *
 * @apiParam {String} token required
 * @apiParam {String} gender optional (male, female)
 * @apiParam {String} lat optional 
 * @apiParam {String} lng optional 
 * @apiParam {String} age_range optional (20,25) 
 * @apiParam {Number} distance optional 
 *
 */

router.post('/discover', verifyToken.verify, function (req, res, next) {

    ImageUpload.uploadFields(req, res, function (err) {
        if (err) {
            res.send({status: false, msg: err});
        } else {
            var whereArr = [
                {status: 1},
                {id: {$ne: req.users.id}}
            ];

            if (typeof req.body.gender != 'undefined') {
                whereArr.push({gender: req.body.gender});
            }
            if (typeof req.body.age_range != 'undefined') {
                var ageArr = req.body.age_range.split(',');
                var date2 = moment().subtract(ageArr[0], 'years').format('YYYY-MM-DD');
                var date1 = moment().subtract(ageArr[1], 'years').format('YYYY-MM-DD');
                whereArr.push({dob: {$gte: date1}});
                whereArr.push({dob: {$lte: date2}});
            }

//            if (typeof req.body.lat != 'undefined' && typeof req.body.lng != 'undefined') {
//
////                var location = sequelize.literal(`ST_GeomFromText('POINT(${req.body.lat} ${req.body.lng})')`);
////                var distance = sequelize.fn('ST_Distance_Sphere', sequelize.literal('geolocationpoint'), location);
//                var aa = sequelize.fn('SQRT',
//                sequelize.fn('POW', sequelize.literal("69.1 * ("+sequelize.col('lat')+" - ["+req.body.lat+"]"), 2) + "+" + 
//                sequelize.fn('POW', sequelize.literal("69.1 * ("+req.body.lng+" - ["+sequelize.col('lng')+"]) * " + sequelize.fn('COS', sequelize.literal(sequelize.col('lat')+" / 57.3"))), 2)
//                );
//                
////                req.where = {'distance1': {$lte: 25}};
//                req.having = {'distance1': {$lte: 25}};
//            }
//            console.log(req.where);
            req.where = whereArr;
            req.attributesFieldsUser = ['id', 'name', 'profile_img', 'profile_video', 'location', 'work', 'education', 'about', ['id', 'age'], ['id', 'distance']];
//            req.attributesFieldsUser.push([aa, 'distance1']);
            models[modelName].getAllValues(req, function (results) {
                if (results != null) {

                    var res1 = [];
                    async.forEachOf(results, function (value, key, callback) {

                        if (value.photos.length != 0) {
                            value.profile_img = value.photos[0].name;
                            res1.push(value);
                        } else {
                            value.profile_img = '';
                            res1.push(value);
                        }
                        callback('', null)
                    }, function (err) {
                        req.returnObj = {status: true, results: res1};
                        responseReturn.returnObj(req, res, function (err) {

                        });
                    });




                } else {
                    req.returnObj = {status: false, msg: 'save failed'};
                    responseReturn.returnObj(req, res, function (err) {

                    });
                }
            });
        }
    });
});


/**
 * @api {get} api/users/upload_profile Request User upload_profile
 * @apiName upload_profile
 * @apiGroup User
 *
 * @apiParam {String} token required
 * @apiParam {String} file required
 *
 */
router.post('/upload_profile', verifyToken.verify, upload.array('file', 1), function (req, res, next) {

    var fileType = req.files[0].mimetype.split('/');
    console.log(fileType[0]);
    if (fileType[0] == 'image') {
        req.body.profile_img = req.files[0].location;

    } else if (fileType[0] == 'video') {
        req.body.profile_video = req.files[0].location;
    }
    console.log(fileType);
    req.where = {id: req.users.id};

    models[modelName].updateAllValues(req, function (results) {
        if (results.status) {
            req.returnObj = {status: true};
            req.returnStatus = 200;
            responseReturn.returnObj(req, res, function (err) {

            });
        } else {
            req.returnStatus = 200;
            req.returnObj = {status: false, msg: 'Update failed'};
            responseReturn.returnObj(req, res, function (err) {

            });
        }
    });

});


/**
 * @api {get} api/users/upload_images Request User images
 * @apiName upload_images
 * @apiGroup User
 *
 * @apiParam {String} token required
 * @apiParam {String} file required
 *
 */
router.post('/upload_images', verifyToken.verify, upload.array('file', 1), function (req, res, next) {

    var fileType = req.files[0].mimetype.split('/');
    console.log(fileType[0]);
//    if (fileType[0] == 'image') {
    req.body.user_id = req.users.id;
    req.body.name = req.files[0].location;

//    }
    models['Photo'].saveAllValues(req, function (results) {
        if (results.status) {
            req.returnObj = {status: true};
            req.returnStatus = 200;
            responseReturn.returnObj(req, res, function (err) {

            });
        } else {
            req.returnStatus = 200;
            req.returnObj = {status: false, msg: 'save failed'};
            responseReturn.returnObj(req, res, function (err) {

            });
        }
    });

});

/**
 * @api {post} /api/users/get_steps Request get_steps
 * @apiName get_steps
 * @apiGroup User
 *
 */

router.get('/get_steps', function (req, res, next) {

    req.returnStatus = 200;
    req.returnObj = {status: true, results: data_freak};
    responseReturn.returnObj(req, res, function (err) {

    });
});

/**
 * @api {post} api/users/save_swipe Request User save_swipe
 * @apiName save_swipe
 * @apiGroup User
 *
 * @apiParam {String} token required
 * @apiParam {String} user_id required
 * @apiParam {String} type right/left/superlike required
 *
 */

router.post('/save_swipe', verifyToken.verify, function (req, res, next) {

    ImageUpload.uploadFields(req, res, function (err) {
        if (err) {
            res.send({status: false, msg: err});
        } else {


//            req.where = {id: req.users.id};
            var userId = req.users.id;
            req.bodydata = {};
            req.viewdata = {};
            if (req.body.type && req.body.type == 'right') {
                var modeTable = 'Like';
                req.bodydata.by_user_id = userId;
                req.bodydata.user_id = req.body.user_id;
                req.bodydata.type = 1;

                req.viewdata.by_user_id = userId;
                req.viewdata.user_id = req.body.user_id;
            }
            if (req.body.type && req.body.type == 'left') {
                var modeTable = 'Like';
                req.bodydata.by_user_id = userId;
                req.bodydata.user_id = req.body.user_id;
                req.bodydata.type = 0;

                req.viewdata.by_user_id = userId;
                req.viewdata.user_id = req.body.user_id;
            }

            if (req.body.type && req.body.type == 'superlike') {
                var modeTable = 'SuperLike';
                req.bodydata.by_user_id = userId;
                req.bodydata.user_id = req.body.user_id;

                req.viewdata.by_user_id = userId;
                req.viewdata.user_id = req.body.user_id;
            }

            req.body = req.bodydata;
            models[modeTable].saveAllValues(req, function (results) {
                if (results.status) {

                    req.body = req.viewdata;
                    models['View'].saveAllValues(req, function (resultsView) {

                        if (resultsView.status) {
                            req.returnObj = {status: true};
                            req.returnStatus = 200;
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        } else {
                            req.returnStatus = 200;
                            console.log(resultsView.errors);
                            req.returnObj = {status: false, msg: 'Save failed'};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        }

                    });


                } else {
                    req.returnStatus = 200;
                    console.log(results.errors);
                    req.returnObj = {status: false, msg: 'Save failed'};
                    responseReturn.returnObj(req, res, function (err) {

                    });
                }
            });


        }
    });
});

module.exports = router;
