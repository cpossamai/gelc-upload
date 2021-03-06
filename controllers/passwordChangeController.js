const User = require('../models/User')
const jwt = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail');

exports.emailToken = function (req, res) {
  return new Promise((resolve, reject) => {
    
    User.findByEmail(req.body.email).then(function (userDocument) {

      jwt.sign({ email: userDocument.email, exp: Math.floor(Date.now() / 1000) + (60 * 10) }, process.env.JWTSECRET, (err, token) => {
       

        
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const msg = {
            to: userDocument.email,
            from: 'noreply@gelc.org.au',
            subject: 'Reset Goldfields Employment Learning Centre Password',
            html: '<p>Please click <a href="http://localhost:3000/forgotpassword/' + token + '">link</a> to reset password</p>'
          };
          sgMail.send(msg);
          res.redirect('/')
        
        
        resolve(token)
      })
    }).catch(function (e) {
    
      reject(e)
    })
  })

}

exports.gotToken = function (req, res) {
  
  jwt.verify(req.params.id, process.env.JWTSECRET, (err, validity) => {
    if (err) {
      
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
  
    jwt.verify(req.body.token, process.env.JWTSECRET, (err, validity) => {
      if (err) {
        
        if (err.name == 'TokenExpiredError') {
          req.flash("errors", "Token in email has expired, please request another password reset email")
          req.session.save(function () {
            res.render('forgot-password', { token: false, errors: req.flash('errors'), regErrors: req.flash('regErrors') })
          })
        }
      }
      if (validity) {
        
        User.findByEmail(validity.email).then((userDocument) => {
        
          User.updatePassword(req.body.password, userDocument.email).then((update) => {
           
            

            res.redirect('/')
          }).catch((e) => {
            reject(e)
          })

        }).catch((e) => {
          reject(e)
        })


      }
    })
  } else {
    
    req.flash("errors", errors)
    req.session.save(function () {
      res.render('forgot-password', { token: false, errors: req.flash('errors'), regErrors: req.flash('regErrors') })
    })
  }
}

exports.forgotPassword = function (req, res) {
  res.render('forgot-password', { token: false, errors: req.flash('errors'), regErrors: req.flash('regErrors') })
}
