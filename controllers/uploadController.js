const Upload = require('../models/Upload')
const Course = require('../models/Course')
const fs = require('fs')
const path = require('path')
//const appBundle = require('./dist/app-bundle.js')

exports.viewCreateScreen = function (req, res) {
  Course.CoursesToArray().then((courses) => {
    res.render('upload-work', { success: false, errors: req.flash('error'), courses: courses })
  }).catch((e) => { 
    console.log("uploadController.viewCreateScreen - error getting courses",e)
    res.render(404)
  })

}

exports.errorReply = function (req, res, next) {
  if (req.flash('errors').length > 0) {
    console.log("entered 1")
    Course.CoursesToArray().then((courses) => {
      res.render('upload-work', { success: false, errors: req.flash('error'), courses: courses })
    }).catch((e) => { 
      console.log("uploadController.viewCreateScreen - error getting courses",e)
      res.render(404)
    })
  } else {
    console.log("entered 2")
    next()
  }
}

exports.reply = function (req, res) {

  Course.CoursesToArray().then((courses) => {
    res.render('upload-work', { success: true, errors: req.flash('error'), courses: courses })
  }).catch((e) => { 
    console.log("uploadController.viewCreateScreen - error getting courses",e)
    res.render(404)
  })

}

exports.create = function (req, res, next) {
  let upload = new Upload(req.body, req.files, req.session.user._id)
  upload.create().then(function () {
    next()


  }).catch(function (errors) {
    console.log("Error in uploadController.create ", errors)
    req.flash('errors', errors)
    req.session.save(() => {
      Course.CoursesToArray().then((courses) => {
        res.render('upload-work', { success: false, errors: req.flash('error'), courses: courses })
      }).catch((e) => { 
        console.log("uploadController.viewCreateScreen - error getting courses",e)
        res.render(404)
      })
    })

  })
}



exports.viewSingle = async function (req, res) {
  try {
    let pdfFile = ""
    let upload = await Upload.findSingleById(req.params.id, req.visitorId)

    await Upload.downloadFile(upload.file)

    if (upload.file[0].filename.slice(-4) == ".pdf") {
      pdfFile = path.join('uploads', upload.file[0].filename)
    } else {

      pdfFile = path.join('uploads', upload.file[0].filename + '.pdf')
    }
    let change = 0
    let sent = 0
    fs.watch('uploads', (folderChange) => {

      if (folderChange == "change") {
        change++
      }
      if (change == 2 && sent == 0) {
        fs.readFile(pdfFile, (err, data) => {

          res.setHeader('Content-Type', 'application/pdf')
          sent = 1
          res.send(data)

        })
      }
    })


    // res.render('single-file-screen', {upload: upload})
  } catch {
    res.render('404')
  }  //fs.unlink(pdfFile)
}