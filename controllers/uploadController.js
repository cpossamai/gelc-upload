const Upload = require('../models/Upload')
const fs = require('fs')
const path = require('path')
//const appBundle = require('./dist/app-bundle.js')

exports.viewCreateScreen = function (req, res) {
  res.render('upload-work')
}

exports.upload = function (req, res, next) {

  const title = req.body.title

  const comments = req.body.comments
  console.log("title: " + title)
  console.log("file:" + req.files)
  console.log("comments:" + comments)

}

exports.create = function (req, res) {
  let upload = new Upload(req.body, req.files, req.session.user._id)
  upload.create().then(function () {
    res.send("File uploaded.")
    //res.redirect('/login')
  }).catch(function (errors) {
    res.send(errors)
  })

  res.redirect('/files/' + req.session.user.username)
}



exports.viewSingle = async function (req, res) {
  try {
    let pdfFile = ""
    let upload = await Upload.findSingleById(req.params.id, req.visitorId)
    console.log('params', upload.file)
    let download = await Upload.downloadFile(upload.file)
    console.log('dirname:', __dirname)
    console.log(upload.file[0].filename.slice(-4))
    if (upload.file[0].filename.slice(-4) == ".pdf") {
      pdfFile = path.join('uploads', upload.file[0].filename)
    } else {
      console.log('exists:', fs.existsSync('./uploads/' + upload.file[0].filename + '.pdf'))
      pdfFile = path.join('uploads', upload.file[0].filename + '.pdf')
    }
    let change = 0
    let sent = 0
    fs.watch('uploads', (folderChange) => {
      console.log(folderChange)
      if (folderChange == "change") {
        change++
      }
      if (change == 2 && sent == 0) {
        fs.readFile(pdfFile, (err, data) => {
          if (err) {
            console.log("didn't work")
          }
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