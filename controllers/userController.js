const User = require('../models/User')
const Post = require('../models/Post')
const Upload = require('../models/Upload')
const jwt = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail');

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    req.flash("errors", "You must be logged in to perform that action.")
    req.session.save(function () {
      res.redirect('/')
    })
  }
}

exports.emailToken = function (req, res) {
  return new Promise((resolve, reject) => {
    console.log("email:", req.body.email)
    User.findByEmail(req.body.email).then(function (userDocument) {

      jwt.sign({ email: userDocument.email, exp: Math.floor(Date.now() / 1000) + (60 * 10) }, process.env.JWTSECRET, (err, token) => {
        if (err) {
          console.log(e)
        }

        try {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const msg = {
            to: userDocument.email,
            from: 'noreply@gelc.org.au',
            subject: 'Reset Goldfields Employment Learning Centre Password',
            html: '<p>Please click <a href="http://localhost:3000/forgotpassword/' + token + '">link</a> to reset password</p>'
          };
          sgMail.send(msg);
          res.redirect('/')
        } catch (e) {
          console.log(e)
        }
        console.log(msg)
        resolve(token)
      })
    }).catch(function (e) {
      console.log(e)
      reject(e)
    })
  })

}

exports.gotToken = function (req, res) {
  console.log(req.params.id)
  jwt.verify(req.params.id, process.env.JWTSECRET, (err, validity) => {
    if (err) {
      console.log("err:", err)
      if (err.name == 'TokenExpiredError') {
        req.flash("errors", "Token in email has expired, please request another password reset email")
        req.session.save(function () {
          res.render('forgot-password', { token: false, errors: req.flash('errors'), regErrors: req.flash('regErrors') })
        })
      }
    }
    if (validity) {
      res.render('forgot-password', { token: req.params.id, email: validity.email, errors: req.flash('errors'), regErrors: req.flash('regErrors') })
    }
  })
}

exports.resetPassword = function (req, res) {
  let errors = []
  if (req.body.password == "") { errors.push("You must provide a password.") }
  if (req.body.password.length > 0 && req.body.password.length < 8) { errors.push("Password must be at least 8 characters.") }
  if (req.body.password.length > 50) { errors.push("Password cannot exceed 50 characters.") }
  if (errors.length == 0) {
    console.log("entered resetpassword")
    jwt.verify(req.body.token, process.env.JWTSECRET, (err, validity) => {
      if (err) {
        console.log("err:", err)
        if (err.name == 'TokenExpiredError') {
          req.flash("errors", "Token in email has expired, please request another password reset email")
          req.session.save(function () {
            res.render('forgot-password', { token: false, errors: req.flash('errors'), regErrors: req.flash('regErrors') })
          })
        }
      }
      if (validity) {
        console.log("enetered Validity")
        User.findByEmail(validity.email).then((userDocument) => {
          console.log(userDocument.password)
          User.updatePassword(req.body.password, userDocument.email).then((update) => {
           
            

            res.redirect('/')
          }).catch((e) => {
            console.log("catch1:",e)
          })

        }).catch((e) => {
          console.log("catch2:",e)
        })


      }
    })
  } else {
    console.log("got errors in entered resetpassword")
    req.flash("errors", errors)
    req.session.save(function () {
      res.render('forgot-password', { token: false, errors: req.flash('errors'), regErrors: req.flash('regErrors') })
    })
  }
}

exports.forgotPassword = function (req, res) {
  res.render('forgot-password', { token: false, errors: req.flash('errors'), regErrors: req.flash('regErrors') })
}
exports.login = function (req, res) {
  let user = new User(req.body)
  user.login().then(function (result) {
    req.session.user = { avatar: user.avatar, username: user.data.username, _id: user.data._id }
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

exports.profileFilesScreen = function (req, res) {
  // ask our post model for posts by a certain author id
  Upload.findByAuthorId(req.profileUser._id).then(function (files) {
    res.render('profileFiles', {
      files: files,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar
    })
  }).catch(function () {
    res.render("404")
  })

}