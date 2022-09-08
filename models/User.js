var i18n_Validation = new (require('i18n-2'))({
    locales: ['en_valiation']
});
i18n_Validation.setLocale('en_valiation');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var env = require('../config/env');

module.exports = function (sequelize, DataTypes) {
    var myModel = sequelize.define("User",
            {
                name: {
                    type: DataTypes.STRING,
                    validate: {
                        notEmpty: {
                            msg: i18n_Validation.__('required')
                        },
                    }
                },
                email: {
                    type: DataTypes.STRING,
                    validate: {
                        isEmail: {
                            msg: i18n_Validation.__('Please_Enter', 'Valid Email Address')
                        },
                        isUnique: function (value, next) {
                            var self = this;
                            myModel.find({
                                where: {email: value},
                                attributes: ['id']
                            })
                                    .then(function (data) {
                                        // reject if a different user wants to use the same email
                                        if (data && Number(self.id) !== data.id) {
                                            return next(i18n_Validation.__('AlreadyExist', 'Email'));
                                        }
                                        return next();
                                    })
                                    .catch(function (err) {
                                        return next(err);
                                    });

                        },
                        notEmpty: {
                            msg: i18n_Validation.__('required')
                        },
                    }
                },
                password: {
                    type: DataTypes.STRING,
                    validate: {
                        notEmpty: {
                            msg: i18n_Validation.__('required')
                        },
                    }
                },
                mobile: {
                    type: DataTypes.INTEGER,
                    validate: {
                        ismobileNo: function (val) {
                            if (val.length != 0 && val.length < 10 || isNaN(val)) {
                                throw new Error(i18n_Validation.__('Please_Enter', 'Valid Mobile Number'))
                            }
                        }

                    }
                },
                dob: {
                    type: DataTypes.STRING,
                },
                gender: {
                    type: DataTypes.STRING,
                },
                lat: {
                    type: DataTypes.INTEGER,
                },
                lng: {
                    type: DataTypes.INTEGER,
                },
                address: {
                    type: DataTypes.STRING,
                },
                about: {
                    type: DataTypes.STRING,
                },
                profile_img: {
                    type: DataTypes.STRING,
                },
                profile_video: {
                    type: DataTypes.STRING,
                },
                distance_type: {
                    type: DataTypes.STRING,
                },
                age_range: {
                    type: DataTypes.STRING,
                },
                max_distance: {
                    type: DataTypes.INTEGER,
                },
                show_me_gender: {
                    type: DataTypes.STRING,
                },
                height: {
                    type: DataTypes.INTEGER,
                },
                work: {
                    type: DataTypes.STRING,
                },
                job: {
                    type: DataTypes.STRING,
                },
                education: {
                    type: DataTypes.STRING,
                },
                highest_attended: {
                    type: DataTypes.INTEGER,
                },
                politics: {
                    type: DataTypes.INTEGER,
                },
                drinking: {
                    type: DataTypes.INTEGER,
                },
                drugs: {
                    type: DataTypes.INTEGER,
                },
                smoking: {
                    type: DataTypes.INTEGER,
                },
                religious: {
                    type: DataTypes.INTEGER,
                },
                ethancity: {
                    type: DataTypes.INTEGER,
                },
                kids: {
                    type: DataTypes.INTEGER,
                },
                view_cnt: {
                    type: DataTypes.INTEGER,
                },
                match_cnt: {
                    type: DataTypes.INTEGER,
                },
                interested_cnt: {
                    type: DataTypes.INTEGER,
                },
                notmatch_cnt: {
                    type: DataTypes.INTEGER,
                },
                coin: {
                    type: DataTypes.INTEGER,
                },
                device_type: {
                    type: DataTypes.STRING,
                },
                device_id: {
                    type: DataTypes.INTEGER,
                },
                status: {
                    type: DataTypes.INTEGER,
                },
                email_varified: {
                    type: DataTypes.STRING,
                },
                remember_token: {
                    type: DataTypes.STRING,
                },
                notification: {
                    type: DataTypes.STRING,
                },
                location: {
                    type: DataTypes.STRING,
                },
                family: {
                    type: DataTypes.STRING,
                },
                geolocationpoint: {
                    type: DataTypes.GEOMETRY('POINT', 4326),
                },
            },
            {
                tableName: 'users',
                classMethods: {
                    getAllValues: function (req, res) {

                        var users_photos = myModel.hasMany(sequelize.models.Photo, {as: 'photos', foreignKey: 'user_id'});

                        myModel.findAll({
                            attributes: req.attributesFieldsUser,
                            where: req.where,
//                            having: {distance1: {$lte: 25}},
                            include: [
                                {association: users_photos, include: []},
                            ]
                        }).then(function (results) {
                            res(results);
                        });
                    },
                    getFirstValues: function (req, res) {

                        var where_fb_id = {};
                        if (req.where_fb_id) {
                            where_fb_id = req.where_fb_id;
                        }

                        var users_social_logins = myModel.hasMany(sequelize.models.SocialLogin, {as: 'social_logins', foreignKey: 'user_id'});
                        myModel.findOne({where: req.where,
                            include: [
                                {association: users_social_logins, include: [], where: where_fb_id, required: false},
                            ]})
                                .then(function (results) {
                                    res(results);
                                });
                    },
                    generateToken: function (req, res) {
                        myModel.findOne({where: req.where})
                                .then(function (results) {
                                    if (results) {
                                        var jwt_auth = jwt.sign({id: results.id}, env.jwtToken.token, {expiresIn: env.jwtToken.expiresInSec});
                                        res(jwt_auth);
                                    } else {
                                        results = null;
                                        res(results);
                                    }
                                });
                    },
                    saveAllValues: function (req, res) {

                        //req.body.user_id = req.user.id;
                        var users_social_logins = myModel.hasMany(sequelize.models.SocialLogin, {as: 'social_logins', foreignKey: 'user_id'});
                        if (req.body.password) {
                            req.body.password = bcrypt.hashSync(req.body.password, 10)
                        }
                        myModel.create(req.body, {
                            include: [
                                users_social_logins
                            ]
                        }).then(function (results) {
                            results.status = 1;

                            res(results);
                        }).catch(function (err) {

                            var errors = err;
                            errors.status = false;
                            res(errors);
                        });
                        //});
                    },
                    updateAllValues: function (req, res) {
                        console.log('qqqqqqqqq');
                        console.log(req.body);
                        console.log(req.where);
                        myModel.update(req.body, {where: req.where}).then(function (data) {
                            var results = {};
                            results = req.body;
                            results.status = true;
                            res(results);
                        }).catch(function (err) {

                            var errors = err;
                            errors.status = false;
                            res(errors);
                        });
                    },
                }
            }

    );
    return myModel;
};