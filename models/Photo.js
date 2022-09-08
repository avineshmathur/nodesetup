var i18n_Validation = new (require('i18n-2'))({
    locales: ['en_valiation']
});
i18n_Validation.setLocale('en_valiation');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var env = require('../config/env');

module.exports = function (sequelize, DataTypes) {
    var myModel = sequelize.define("Photo",
            {
                user_id: {
                    type: DataTypes.INTEGER,
                },
                name: {
                    type: DataTypes.STRING,
                },
                status: {
                    type: DataTypes.STRING,
                },
            },
            {
                tableName: 'photos',
                classMethods: {
//                    getAllValues: function (req, res) {
//
//                        var includeArr = [];
//                        if (req.returnUserType == 'user2') {
//                            var users = myModel.belongsTo(sequelize.models.User, {as: 'users', foreignKey: 'user_id'});
//                            includeArr.push({association: users, include: [], attributes: req.attributesFieldsUser});
//                        }
//                        if (req.returnUserType == 'user1') {
//                            var users = myModel.belongsTo(sequelize.models.User, {as: 'users', foreignKey: 'by_user_id'});
//                            includeArr.push({association: users, include: [], attributes: req.attributesFieldsUser});
//                        }
//
//                        myModel.findAll({
//                            attributes: req.attributesFieldsMain,
//                            where: req.where,
//                            include: includeArr
//                        }).then(function (results) {
//                            res(results);
//                        });
//                    },
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