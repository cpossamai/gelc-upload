const User = require('../models/User')
const Post = require('../models/Post')
const Upload = require('../models/Upload')


exports.mustBeLoggedIn = function (req, res, next) {
  try{
  if (req.session.user) {
    next()
  } else {
    req.flash("errors", "You must be logged in to perform that action.")
    req.session.save(function () {
      res.redirect('/')
    })
  }
}catch{
  console.log("Error in userController.mustBeLoggedIn")
}
}

exports.adminMustBeLoggedIn = function (req, res, next) {
  try{
    
  if (req.session.user.admin) {
    console.log(req.session.user.username)
    next()
  } else {
    req.flash("errors", "You must be logged in to perform that action.")
    req.session.save(function () {
      res.redirect('../')
    })
  }
}catch{
  console.log("Error in userController.mustBeLoggedIn")
  req.flash("errors", "You must be logged in to perform that action.")
    req.session.save(function () {
      res.redirect('../')
    })
}
}

exports.login = function (req, res) {
  let user = new User(req.body)
  user.login().then(function (result) {
    req.session.user = { avatar: user.avatar, username: user.data.username, _id: user.data._id, admin:user.data.admin}
    req.session.save(function () {
      res.redirect('/')
    })
  }).catch(function (e) {
    req.flash('errors', e)
    req.session.save(function () {
      res.redirect('/')
    })
  })
}

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect('/')
  })
}

exports.register = function (req, res) {
  let user = new User(req.body)
  user.register().then(() => {
    req.session.user = { username: user.data.username, avatar: user.avatar, _id: user.data._id }
    req.session.save(function () {
      res.redirect('/')
    })
  }).catch((regErrors) => {
    regErrors.forEach(function (error) {
      req.flash('regErrors', error)
    })
    req.session.save(function () {
      res.redirect('/')
    })
  })
}

exports.home = function (req, res) {
  if (req.session.user) {
    res.render('home-dashboard')
  } else {
    res.render('home-guest', { errors: req.flash('errors'), regErrors: req.flash('regErrors') })
  }
}

exports.ifUserExists = function (req, res, next) {
  User.findByUsername(req.params.username).then(function (userDocument) {
    req.profileUser = userDocument
    next()
  }).catch(function () {
    res.render("404")
  })
}

exports.profilePostsScreen = function (req, res) {
  // ask our post model for posts by a certain author id

  Post.findByAuthorId(req.profileUser._id).then(function (posts) {
    res.render('profile', {
      posts: posts,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar
    })
  }).catch(function () {
    res.render("404")
  })

}

exports.displayAllUsers= function(req,res){
  User.getAllUsers().then((users)=>{
    res.render('allUsers',{
      users: users,
     })}).catch((e)=>{
       console.log(e)
      res.render("404")
     }
  )
  
}

exports.profileFilesScreen = function (req, res) {
  // ask our post model for posts by a certain author id
  try{
  Upload.findByAuthorId(req.profileUser._id).then(function (files) {
    res.render('profileFiles', {
      files: files,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar
    })
  }).catch(function () {
    
    res.render("404")
  })
}catch(e){
  console.log("Error in userController.profileFilesScreen",e)
}
}

exports.adminProfileFilesScreen = function (req, res) {
  // ask our upload model for files by a certain author id
  try{
    console.log("id:",req.params.id)
    
    User.findById(req.params.id).then((user)=>{
      console.log(user)
    
  Upload.findByAuthorId(req.params.id).then(function (files) {
    console.log(files)
    res.render('profileFiles', {
      files: files,
      profileUsername: user.username,
      profileAvatar: user.avatar
    })
  }).catch(function (e) {
    console.log(e)
    res.render("404")
  })
}).catch((e)=>{console.log(e)})
}catch(e){
  console.log("Error in userController.profileFilesScreen",e)
}
}