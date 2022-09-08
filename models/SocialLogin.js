var i18n_Validation = new (require('i18n-2'))({
    locales: ['en_valiation']
});
i18n_Validation.setLocale('en_valiation');

module.exports = function (sequelize, DataTypes) {
    var myModel = sequelize.define("SocialLogin",
            {
                user_id: {
                    type: DataTypes.INTEGER,
                    validate: {
                        notEmpty: {
                            msg: i18n_Validation.__('required')
                        },
                    }
                },
                social_id: {
                    type: DataTypes.STRING,
                    validate: {
                        notEmpty: {
                            msg: i18n_Validation.__('required')
                        },
                    }
                },
                social_type: {
                    type: DataTypes.STRING,
                    validate: {
                        notEmpty: {
                            msg: i18n_Validation.__('required')
                        },
                    }
                },
            },
            {
                tableName: 'social_logins',
                classMethods: {
                    getAllValues: function (req, res) {
                        myModel.findAll({where: req.where}).then(function (results) {
                            res(results);
                        });
                    },
                    getFirstValues: function (req, res) {
                        var social_login_users = myModel.belongsTo(sequelize.models.User, {as: 'users', foreignKey: 'user_id'});
                        myModel.findOne({where: req.where,
                            include: [social_login_users]
                        })
                                .then(function (results) {
                                    res(results);
                                });
                    },
                    saveAllValues: function (req, res) {

                        //req.body.user_id = req.user.id;

                        myModel.create(req.body).then(function (results) {
                            results.status = 1;

                            res(results);
                        }).catch(function (err) {

                            var errors = err;
                            errors.status = false;
                            res(errors);
                        });
                        //});
                    },
                }
            }

    );
    return myModel;
};