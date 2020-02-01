const express = require('express')
const router = express.Router()

const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const courseController = require('./controllers/courseController')
const uploadController = require('./controllers/uploadController')
const passwordChangeController = require('./controllers/passwordChangeController')
const multer = require('multer');


//Multer
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
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
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


      
      req.flash('errors', "The file is the wrong file type, check with your instructor what to do next ")
      req.session.save(() => {
cb("The file is the wrong file type, check with your instructor what to do next" ,false);

      })
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

//password change routes
router.get('/forgotPassword', passwordChangeController.forgotPassword)
router.post('/forgotPassword', passwordChangeController.emailToken)
router.get('/forgotPassword/:id', passwordChangeController.gotToken)
router.post('/resetPassword', passwordChangeController.resetPassword)


//profile related routes

router.get('/profile/:username', userController.mustBeLoggedIn, userController.ifUserExists, userController.profilePostsScreen)
try {
  router.get('/files/:username', userController.mustBeLoggedIn, userController.ifUserExists, userController.profileFilesScreen)
} catch (e) {
  console.log("Error in router.get('/files/'")
}
router.post('/files/:username', userController.mustBeLoggedIn, userController.ifUserExists, userController.profileFilesScreen)
//post related routes

router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)

router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.get('/post/:id', postController.viewSingle)

router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen)
router.post('/post/:id/delete', userController.mustBeLoggedIn, postController.deletePost)

//upload related posts
router.post('/upload-file', userController.mustBeLoggedIn, uploads.array('myFiles', 5), function (req, res, next) {
  req.files.forEach(element => {
    console.log(element.size)
    if (element.size > 5242880) {
      console.log("too large")

      req.flash('errors', "The file is too large, check with your instructor what to do next")
      req.session.save(() => {
        res.render('upload-work', { success: false, errors: req.flash('errors') })
      })

    } else {
      console.log("ok size")

      next()
    }
  });
}, uploadController.errorReply, uploadController.create, uploadController.reply)

router.get('/upload-file', userController.mustBeLoggedIn, uploadController.viewCreateScreen)
try {
  router.get('/file/:id', userController.mustBeLoggedIn, uploadController.viewSingle)
} catch (e) {
  console.log("Error in router.get('/file/:id'", e)
}

//Course related routes
router.post('/addCourse', userController.adminMustBeLoggedIn, courseController.addCourse, courseController.displayCourses)
router.post('/course/:id/edit', userController.adminMustBeLoggedIn, courseController.updateCourse, courseController.displayCourses)
router.get('/course/:id/delete', userController.adminMustBeLoggedIn, courseController.deleteCourse, courseController.displayCourses)
router.get('/displayCourses', userController.adminMustBeLoggedIn, courseController.displayCourses)

//enrol routes
router.get('/enrol',function (req, res) {
    res.render('enrol')})
router.get('/course/:id/content',userController.adminMustBeLoggedIn, courseController.addContent)


module.exports = router

