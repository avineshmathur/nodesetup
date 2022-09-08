var i18n_Validation = new (require('i18n-2'))({
    locales: ['en_valiation']
});
i18n_Validation.setLocale('en_valiation');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var env = require('../config/env');
var async = require("async");

module.exports = function (sequelize, DataTypes) {
    var myModel = sequelize.define("Matche",
            {
                user_id_one: {
                    type: DataTypes.INTEGER,
                },
                user_id_two: {
                    type: DataTypes.INTEGER,
                },
                created_at: {
                    type: DataTypes.STRING,
                },
            },
            {
                tableName: 'matches',
                classMethods: {
                    getAllValues: function (req, res) {

                        var users_1 = myModel.belongsTo(sequelize.models.User, {as: 'users_1', foreignKey: 'user_id_one'});
                        var users_2 = myModel.belongsTo(sequelize.models.User, {as: 'users_2', foreignKey: 'user_id_two'});
                        var users_photos = sequelize.models.User.hasMany(sequelize.models.Photo, {as: 'photos', foreignKey: 'user_id'});
                        
                        myModel.findAll({
                            where: req.where,
                            include: [
                                {association: users_1, include: [{association: users_photos}], attributes: req.attributesFieldsUser},
                                {association: users_2, include: [{association: users_photos}], attributes: req.attributesFieldsUser},
                            ]}).then(function (results) {
//                            console.log(results);
                            var finalUsers = [];

                            async.forEachOf(results, function (value, key, callback) {

                                var userList = {};
                                userList.id = value.id;
                                userList.created_at = value.created_at;
                                if (value.users_1.id == req.users.id) {
                                    userList.users = value.users_2;
                                } else {
                                    userList.users = value.users_1;
                                }
                                finalUsers.push(userList);
                                callback('', null)
                            }, function (err) {
                                var res1 = [];
                                async.forEachOf(finalUsers, function (value, key, callback) {
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
                                res(finalUsers);
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

//                        var users_social_logins = myModel.hasMany(sequelize.models.SocialLogin, {as: 'social_logins', foreignKey: 'user_id'});
//                        if (req.body.password) {
//                            req.body.password = bcrypt.hashSync(req.body.password, 10)
//                        }
//                        myModel.create(req.body, {
//                            include: [
//                                users_social_logins
//                            ]
//                        }).then(function (results) {
//                            results.status = 1;
//
//                            res(results);
//                        }).catch(function (err) {
//
//                            var errors = err;
//                            errors.status = false;
//                            res(errors);
//                        });
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