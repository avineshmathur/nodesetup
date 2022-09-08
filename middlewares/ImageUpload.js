var aws = require('aws-sdk');

var multer = require('multer');
var path = require('path');
var multerS3 = require('multer-s3');


aws.config.update({
    secretAccessKey: '*****',
    accessKeyId: '*****',
    region: ''
});

var s3 = new aws.S3();


function MyModelClass() {

    this.storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads')
        },
        filename: function (req, file, cb) {
            var newName = Date.now() + path.extname(file.originalname);
            cb(null, newName);
        }
    });


    this.upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: 'media.findmeafreak.com',
            metadata: function (req, file, cb) {
                console.log('results');
                cb(null, {fieldName: file.fieldname});
            },
            key: function (req, file, cb) {
                cb(null, Date.now().toString())
            }
        })
    });
    
//    this.uploadOnS3 = function (req,results) {
//        console.log('s33333');
//        
//            this.upload.array('file', 1);
//    };


    this.uploadFile = multer({
        storage: this.storage,
        fileFilter: function (req, file, cb) {
            if (req.filTypeIs && req.filTypeIs == 'all') {
                cb(null, true);
            } else {
                if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {

                    cb('Only image files are allowed!', false);
                } else {
                    cb(null, true);
                }
            }
        }
    }).any();

    this.uploadFields = multer({
        storage: this.storage,
        fileFilter: function (req, file, cb) {
            if (req.filTypeIs && req.filTypeIs == 'all') {
                cb(null, true);
            } else {
                if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {

                    cb('Only image files are allowed!', false);
                } else {
                    cb(null, true);
                }
            }
        }
    }).none();

    this.uploadUserProfilePic = multer({
        storage: this.storage,
        fileFilter: function (req, file, cb) {
            if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
                return cb('Only jpg, jpeg, png, gif files are allowed!', false);
            } else {
                cb(null, true);
            }
        }
    }).any();

    this.mailAttachmentStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "public/uploads/mail-attachments")
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    })
    this.mailAttachment = multer({
        storage: this.mailAttachmentStorage,
        fileFilter: function (req, file, cb) {
            if (req.filTypeIs && req.filTypeIs === 'all') {
                cb(null, true);
            } else {
                if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|doc|DOC|docx|DOCX|xls|XLS|xlsx|XLSX|ppt|PPT|pptx|PPTX|pdf|PDF|txt|TXT)$/)) {
                    cb('Files allowed only for extension jpg, jpeg, png, gif, doc, docx, xls, xlsx, ppt, pptx, pdf, txt', false);
                } else {
                    cb(null, true);
                }
            }
        }
    }).any();


}

module.exports = new MyModelClass();
