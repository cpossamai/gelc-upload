const Upload = require('../models/Upload')
const fs = require('fs')
const path = require('path')
//const appBundle = require('./dist/app-bundle.js')

exports.viewCreateScreen = function (req, res) {
  res.render('upload-work', { success:false, errors: req.flash('error') })
}

exports.upload = function (req, res, next) {

  const title = req.body.title

  const comments = req.body.comments


}

exports.create = function (req, res) {
  let upload = new Upload(req.body, req.files, req.session.user._id)
  upload.create().then(function () {
    res.render('upload-work',{success:true, errors: req.flash('error')})
  }).catch(function (errors) {
    req.flash('errors', errors)
    req.session.save(() => {
      res.render('upload-work',{success:false, errors: req.flash('error')})
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