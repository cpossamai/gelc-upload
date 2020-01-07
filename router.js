const express=require('express')
const router = express.Router()

const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const uploadController = require('./controllers/uploadController')
const passwordChangeController = require('./controllers/passwordChangeController')

const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })


var uploads = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log(file)
   if (file.mimetype === 'application/pdf'||file.mimetype === 'application/octet-stream'||file.mimetype === 'image/jpeg'||file.mimetype === 'image/png'|| file.mimetype === 'text/csv'||file.mimetype === 'text/plain') {
        cb(null, true);
  
            
    }else{
        req.fileValidationError = 'goes wrong on the mimetype';
     return cb(null, false, new Error('goes wrong on the mimetype'));
   
    
   }
},

  


});

//user related routes
router.get('/', userController.home)
router.post('/register', userController.register)

router.post('/login',userController.login)

router.post('/logout',userController.logout)

//password change routes
router.get('/forgotPassword',passwordChangeController.forgotPassword)
router.post('/forgotPassword',passwordChangeController.emailToken)
router.get('/forgotPassword/:id',passwordChangeController.gotToken)
router.post('/resetPassword',passwordChangeController.resetPassword)


//profile related routes

router.get('/profile/:username', userController.mustBeLoggedIn, userController.ifUserExists, userController.profilePostsScreen)
router.get('/files/:username',userController.mustBeLoggedIn, userController.ifUserExists, userController.profileFilesScreen)
router.post('/files/:username',userController.mustBeLoggedIn, userController.ifUserExists, userController.profileFilesScreen)
//post related routes

router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)

router.post('/create-post', userController.mustBeLoggedIn, postController.create)

router.post('/upload-file', userController.mustBeLoggedIn, uploads.array('myFiles',5), function(req,res,next){
    req.files.forEach(element => {
        console.log(element.size)
        if (element.size>5242880){console.log("too large")
      
      
}else {console.log("ok size")

    next()}
    });
}, uploadController.create)

router.get('/upload-file', userController.mustBeLoggedIn, uploadController.viewCreateScreen)

router.get('/post/:id', postController.viewSingle)

router.get('/post/:id/edit', postController.viewEditScreen)

router.get('/file/:id', userController.mustBeLoggedIn, uploadController.viewSingle)



module.exports = router

