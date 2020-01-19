const express = require('express')
const router = express.Router()

const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const courseController = require('./controllers/courseController')
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
    if (file.mimetype === 'application/pdf' || 
    file.mimetype === 'application/octet-stream' || 
    file.mimetype === 'application/vnd.ms-publisher' || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'||
    file.mimetype === 'image/jpeg' || 
    file.mimetype === 'image/png' || 
    file.mimetype === 'text/csv' || 
    file.mimetype === 'application/vnd.ms-excel' || 
    file.mimetype === 'application/msword' || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.template' || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.slideshow' || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      console.log("Error uploading file of type", file.mimetype)
      req.fileValidationError = 'goes wrong on the mimetype';
      return cb(null, false, new Error("Error uploading file of type", file.mimetype));
    }
  },
});

//user related routes
router.get('/', userController.home)
router.post('/register', userController.register)

router.post('/login', userController.login)

router.post('/logout', userController.logout)
router.get('/admin', userController.adminMustBeLoggedIn, userController.displayAllUsers)
router.get('/adminUser/:username', userController.adminMustBeLoggedIn, userController.ifUserExists, userController.profileFilesScreen)
//router.get('/adminUser/:username', userController.ifUserExists, userController.profileFilesScreen)

//password change routes
router.get('/forgotPassword', passwordChangeController.forgotPassword)
router.post('/forgotPassword', passwordChangeController.emailToken)
router.get('/forgotPassword/:id', passwordChangeController.gotToken)
router.post('/resetPassword', passwordChangeController.resetPassword)


//profile related routes

router.get('/profile/:username', userController.mustBeLoggedIn, userController.ifUserExists, userController.profilePostsScreen)
try{
router.get('/files/:username', userController.mustBeLoggedIn, userController.ifUserExists, userController.profileFilesScreen)
}catch(e){
  console.log("Error in router.get('/files/'")
}
router.post('/files/:username', userController.mustBeLoggedIn, userController.ifUserExists, userController.profileFilesScreen)
//post related routes

router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)

router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.get('/post/:id', postController.viewSingle)

router.get('/post/:id/edit', postController.viewEditScreen)

//upload related posts
router.post('/upload-file', userController.mustBeLoggedIn, uploads.array('myFiles',5), function(req,res,next){
  req.files.forEach(element => {
      console.log(element.size)
      if (element.size>5242880){console.log("too large")

      req.flash('errors', "The file is too large, check with your instructor what to do next")
      req.session.save(() => {
        res.render('upload-work',{success:false, errors: req.flash('errors')})})
    
}else {console.log("ok size")

  next()}
  });
}, uploadController.create)

router.get('/upload-file', userController.mustBeLoggedIn, uploadController.viewCreateScreen)
try{
router.get('/file/:id', userController.mustBeLoggedIn, uploadController.viewSingle)
}catch(e){
  console.log("Error in router.get('/file/:id'",e)
}

//Course related routes
router.post('/addCourse', courseController.addCourse)
router.post('/updateCourse', courseController.updateCourse)
router.post('/deleteCourse', courseController.deleteCourse)


module.exports = router

