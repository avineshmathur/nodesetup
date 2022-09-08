var i18n_Validation = new (require('i18n-2'))({
    locales: ['en_valiation']
});
i18n_Validation.setLocale('en_valiation');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var env = require('../config/env');
var async = require("async");

module.exports = function (sequelize, DataTypes) {
    var myModel = sequelize.define("View",
            {
                user_id: {
                    type: DataTypes.INTEGER,
                },
                by_user_id: {
                    type: DataTypes.INTEGER,
                },
            },
            {
                tableName: 'views',
                classMethods: {
                    getAllValues: function (req, res) {

                        var includeArr = [];
                        if (req.returnUserType == 'user2') {
                            var users = myModel.belongsTo(sequelize.models.User, {as: 'users', foreignKey: 'user_id'});
                            var users_photos = sequelize.models.User.hasMany(sequelize.models.Photo, {as: 'photos', foreignKey: 'user_id'});
                            includeArr.push({association: users, include: [{association: users_photos}], attributes: req.attributesFieldsUser});
                        }
                        if (req.returnUserType == 'user1') {
                            var users = myModel.belongsTo(sequelize.models.User, {as: 'users', foreignKey: 'by_user_id'});
                            var users_photos = sequelize.models.User.hasMany(sequelize.models.Photo, {as: 'photos', foreignKey: 'user_id'});
                            includeArr.push({association: users, include: [{association: users_photos}], attributes: req.attributesFieldsUser});
                        }

//                        var users_1 = myModel.belongsTo(sequelize.models.User, {as: 'users_1', foreignKey: 'user_id'});
//                        var users_2 = myModel.belongsTo(sequelize.models.User, {as: 'users_2', foreignKey: 'by_user_id'});
//
//                        var users_photos = myModel.hasMany(sequelize.models.Photo, {as: 'photos', foreignKey: 'user_id'});

                        myModel.findAll({
                            where: req.where,
                            include: includeArr
                        }).then(function (results) {
                            var res1 = [];
                            async.forEachOf(results, function (value, key, callback) {
                                if (value.users.photos.length != 0) {
                                    value.users.profile_img = value.users.photos[0].name;
                                    res1.push(value);
                                } else {
                                    value.users.profile_img = '';
                                    res1.push(value);
                                }
                                callback('', null)
                            }, function (err) {
                                res(res1);
                            });
                        });
                    },
                    getFirstValues: function (req, res) {

//                        var where_fb_id = {};
//                        if (req.where_fb_id) {
//                            where_fb_id = req.where_fb_id;
//                        }
//
//                        var users_social_logins = myModel.hasMany(sequelize.models.SocialLogin, {as: 'social_logins', foreignKey: 'user_id'});
//                        myModel.findOne({where: req.where,
//                            include: [
//                                {association: users_social_logins, include: [], where: where_fb_id, required: false},
//                            ]})
//                                .then(function (results) {
//                                    res(results);
//                                });
                    },
                    saveAllValues: function (req, res) {
                        myModel.create(req.body).then(function (results) {
                            results.status = 1;
                            res(results);
                        }).catch(function (err) {

                            var errors = err;
                            errors.status = false;
                            res(errors);
                        });
                    },
                    updateAllValues: function (req, res) {

//                        myModel.update(req.body, {where: req.where}, {
//                            include: []
//                        }).then(function (data) {
//                            var results = {};
//                            results = req.body;
//                            results.status = true;
//                            res(results);
//                        }).catch(function (err) {
//
//                            var errors = err;
//                            errors.status = false;
//                            res(errors);
//                        });
                    },
                }
            }

    );
    return myModel;
};