var ImageUpload = require('../middlewares/ImageUpload');
var jwt = require('jsonwebtoken');
var env = require('../config/env');
function MyModelClass() {


    this.verify = function (req, res, next) {

        token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, env.jwtToken.token, function (error, users) {
            if (error) {
                console.log(error);
                res.status(401).send({status: false, error: error});
            } else {
                console.log(users);
                req.users = users;
                next();
            }
        });
    }
}
module.exports = new MyModelClass();