var models = require('../models');
var express = require('express');
var router = express.Router();
var ImageUpload = require('../middlewares/ImageUpload');
var responseReturn = require('../middlewares/responseReturn');
var modelName = 'User';
var async = require("async");
var Sequelize = require('sequelize');
var sequelize = require('../config/db');


/**
 * @api {post} /api/users/login Request User Login
 * @apiName Login
 * @apiGroup User
 *
 * @apiParam {String} email required either one email or mobile
 * @apiParam {String} mobile required either one email or mobile
 * @apiParam {String} password required
 *
 */

router.post('/login', function (req, res, next) {

    ImageUpload.uploadFile(req, res, function (err) {
        if (err) {
            res.send({status: false, msg: err, data: []});
        } else {

            req.where = {$or: [{mobile: req.body.mobile}, {email: req.body.email}]};
//            req.where = {email: req.body.email}
            models[modelName].getFirstValues(req, function (results1) {

                if (results1 != null) {
                    req.returnObj = {status: true, jwt_auth: 123456, results: results1};
                    responseReturn.returnObj(req, res, function (err) {


                    });
                } else {
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

    ImageUpload.uploadFile(req, res, function (err) {
        if (err) {
            res.send({status: false, msg: err, data: []});
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
                            req.returnObj = {status: true, jwt_auth: 123456, results: results};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        } else {
                            req.returnObj = {status: false, msg: 'save failed', results: results.errors};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        }
                    });
                } else {
                    req.returnObj = {status: false, msg: 'save failed', results: errors};
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
 * @apiParam {String} fb_id optional 
 * @apiParam {String} name optional
 *
 */

router.post('/fb_login', function (req, res, next) {

    ImageUpload.uploadFile(req, res, function (err) {
        if (err) {
            req.returnObj = {status: false, msg: err, results: []};
            responseReturn.returnObj(req, res, function (err) {

            });
        } else {

            var replacementsArr = [req.body.email];


            if (req.body.fb_id != '') {
                var where1 = 'OR sl.social_id = ? ';
                replacementsArr.push(req.body.fb_id);
            }
            var query_aplevels = '';
            query_aplevels += ' SELECT *, u.id userid FROM users u LEFT JOIN social_logins sl ON u.id = sl.user_id ';
            query_aplevels += ' where u.email = ? ' + where1;

            sequelize.query(query_aplevels,
                    {replacements: replacementsArr, type: sequelize.QueryTypes.SELECT}
            ).then(function (results) {
                if (results != '') {
                    
                    req.where = {id:results[0].userid};
                    models[modelName].getFirstValues(req, function (results) {
                        
                        req.returnObj = {status: true, jwt_auth: 1234560, results: results};
                        responseReturn.returnObj(req, res, function (err) {

                        });

                    });

                } else {
                    models[modelName].saveAllValues(req, function (results) {
                        if (results.status) {
                            req.returnObj = {status: true, jwt_auth: 1234569, results: results};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        } else {
                            req.returnObj = {status: false, msg: 'save failed', results: results.errors};
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
 * @api {post} api/users/mobile_signup Request mobile signup
 * @apiName mobile signup
 * @apiGroup User
 *
 * @apiParam {String} name optional
 * @apiParam {String} email required either one email or mobile
 * @apiParam {String} mobile required 
 * @apiParam {String} password required 
 *
 */

router.post('/mobile_signup', function (req, res, next) {

    ImageUpload.uploadFile(req, res, function (err) {
        if (err) {
            req.returnObj = {status: false, msg: err, results: []};
            responseReturn.returnObj(req, res, function (err) {

            });
        } else {

            req.where = {$or: [{mobile: req.body.mobile}, {email: req.body.email}]};

            models[modelName].getFirstValues(req, function (results) {
                if (results) {
                    req.returnObj = {status: true, jwt_auth: 123456, results: results};
                    responseReturn.returnObj(req, res, function (err) {

                    });
                } else {
                    models[modelName].saveAllValues(req, function (results) {
                        if (results.status) {
                            req.returnObj = {status: true, jwt_auth: 123456, results: results};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        } else {
                            req.returnObj = {status: false, msg: 'save failed', results: results.errors};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        }
                    });
                }

            });
        }
    });
});

router.post('/mobile_signup1', function (req, res, next) {

    ImageUpload.uploadFile(req, res, function (err) {
        if (err) {
            req.returnObj = {status: false, msg: err, results: []};
            responseReturn.returnObj(req, res, function (err) {

            });
        } else {

            req.where = {$or: [{mobile: req.body.mobile}, {email: req.body.email}]};

            models[modelName].getFirstValues(req, function (results) {
                if (results) {
                    req.returnObj = {status: true, jwt_auth: 123456, results: results};
                    responseReturn.returnObj(req, res, function (err) {

                    });
                } else {
                    models[modelName].saveAllValues(req, function (results) {
                        if (results.status) {
                            req.returnObj = {status: true, jwt_auth: 123456, results: results};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        } else {
                            req.returnObj = {status: false, msg: 'save failed', results: results.errors};
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
 * @api {post} api/users/google_login Request Google login
 * @apiName Google Login
 * @apiGroup User
 *
 * @apiParam {String} email
 * @apiParam {String} google_id
 *
 */

router.post('/google_login', function (req, res, next) {

    ImageUpload.uploadFile(req, res, function (err) {
        if (err) {
            req.returnObj = {status: false, msg: err, results: []};
            responseReturn.returnObj(req, res, function (err) {

            });
        } else {

            req.where = {$or: [{google_id: req.body.google_id}, {email: req.body.email}]};

            models[modelName].getFirstValues(req, function (results) {
                if (results) {
                    req.returnObj = {status: true, jwt_auth: 123456, results: results};
                    responseReturn.returnObj(req, res, function (err) {

                    });
                } else {
                    models[modelName].saveAllValues(req, function (results) {
                        if (results.status) {
                            req.returnObj = {status: true, jwt_auth: 123456, results: results};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        } else {
                            req.returnObj = {status: false, msg: 'save failed', results: results.errors};
                            responseReturn.returnObj(req, res, function (err) {

                            });
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
