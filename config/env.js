var db = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: ''
};


var facebook = {
    clientID: '',
    clientSecret: '',
    callbackURL: '',
    successRedirect: '',
    failureRedirect: ''
};


var google = {
    clientID: '',
    clientSecret: '',
    callbackURL: '',
    successRedirect: '',
    failureRedirect: ''
};


var mail = {
    from: 'Demo',
    host: 'smtp.gmail.com',
    port: 25,
    auth: {
        user: '',
        pass: ''
    }
};

var otp = {
    authkey: "",
    senderid: ""
};

var jwtToken = {
    token: "generate_token_hash_key",
    expiresInSec: 7200,  // In sec
};

module.exports.db = db;
module.exports.facebook = facebook;
module.exports.google = google;
module.exports.mail = mail;
module.exports.otp = otp;
module.exports.jwtToken = jwtToken;
