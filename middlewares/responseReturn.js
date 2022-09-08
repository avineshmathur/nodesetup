function responseReturn() {

    this.returnObj = function (req, res) {
        console.log(req.returnObj);
        if (!req.returnObj.status) {
            req.returnObj.errors = {};
//            req.returnObj.error.message = req.returnObj.msg;
//            req.returnObj.error.name = 'error';
//            req.returnObj.error = req.returnObj.error;
            if (typeof req.returnObj.err != 'undefined') {
                req.returnObj.errors = req.returnObj.err;
                delete req.returnObj.err;
            }
            if (typeof req.returnObj.msg != 'undefined') {
                req.returnObj.errors.message = req.returnObj.msg;
                delete req.returnObj.msg;
            }


        }
//        


        if (typeof req.returnStatus != 'undefined') {
            res.status(req.returnStatus).json(req.returnObj);
        } else {
            res.json(req.returnObj);
        }
    }
}
module.exports = new responseReturn();