const uploadsCollection = require('../db').db().collection("uploads")
const db = require('../db')
const ObjectID = require('mongodb').ObjectID
const User = require('./User')
const fs= require('fs')

const libre = require('libreoffice-convert');
 
const path = require('path');
const assert = require('assert')
const mongodb = require('mongodb')
let bucket = new mongodb.GridFSBucket(db.db(),{chunkSizeBytes: 202400});
let uploadStream 
let Upload = function(data, file, userid) {
  this.data = data
  this.errors = []
  this.userid = userid
  for (i=0;i<file.length;i++) {
    file[i]._id=new ObjectID()
  }
  this.file=file 
  
}



Upload.prototype.cleanUp = function() {
  try{
  if (typeof(this.data.title) != "string") {this.data.title = ""}
  if (typeof(this.data.comments) != "string") {this.data.body = ""}
  // get rid of any bogus properties
  this.data = {
    title: this.data.title.trim(),
    comment: this.data.comments.trim(),
    file: this.file,
    createdDate: new Date(),
    author: ObjectID(this.userid)
  }
}catch(e){
  console.log("error in Upload.cleanup",e)
}

}



Upload.prototype.validate = function() {
  try{
  if (this.data.title == "") {this.errors.push("You must provide a title.")}
  if (this.file == "") {this.errors.push("You must provide a file.")}
 }catch(e){
   console.log("Error in Upload.validate",e)
 }}




Upload.prototype.create = async function() {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    try{
    this.data.file.forEach((element,index)=> {
         
          
      fs.createReadStream('./uploads/'+element.filename).
        pipe(uploadStream= bucket.openUploadStream(element._id,'./uploads/'+element.filename)).
        on('error', function(error) {
          assert.ifError(error);
         
        }).
        on('finish', function() {
         
fs.unlink('./uploads/'+element.filename,(err)=>{
  if (err) {
  console.log("Error removing file from hdd",err)}
  
})

                  
        })
                  
        this.data.file[index]._id=uploadStream.id
           
    })}catch(e){
      console.log("Error in Upload.create.forEach",e)
    }
    this.validate()
    
    try{
    if (!this.errors.length) {
      // save upload into database
      
        
        uploadsCollection.insertOne(this.data).then(() => {
          resolve()
        
      }).catch(() => {
        this.errors.push("Please try again later.")
        reject(this.errors)
      })
    } else {
      reject(this.errors)
    }}catch(e){console.log("Error in Upload.create.if block",e)}
  })
}

Upload.reusableUploadQuery = function(uniqueOperations, visitorId) {
  return new Promise(async function(resolve, reject) {
    let aggOperations = uniqueOperations.concat([
      {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
      {$project: {
        title: 1,
        file: 1,
        createdDate: 1,
        authorId: "$author",
        author: {$arrayElemAt: ["$authorDocument", 0]}
      }}
    ])

    let uploads = await uploadsCollection.aggregate(aggOperations).toArray()

    // clean up author property in each upload object
    uploads = uploads.map(function(upload) {
      upload.isVisitorOwner = upload.authorId.equals(visitorId)

      upload.author = {
        username: upload.author.username,
        avatar: new User(upload.author, true).avatar
      }

      return upload
    })

    resolve(uploads)
  })
}

Upload.findSingleById = function(id, visitorId) {
  return new Promise(async function(resolve, reject) {
    if (typeof(id) != "string" || !ObjectID.isValid(id)) {
      reject()
      return
    }
    
    let uploads = await Upload.reusableUploadQuery([
      {$match: {_id: new ObjectID(id)}}
    ], visitorId)

    if (uploads.length) {
     
      resolve(uploads[0])
    } else {
      reject()
    }
  })
}

Upload.findByAuthorId = function(authorId) {
  return Upload.reusableUploadQuery([
    {$match: {author: authorId}},
    {$sort: {createdDate: -1}}
  ])
}


Upload.downloadFile = function(file){
  var outputPath
  return new Promise(async function(resolve, reject) {

  bucket.openDownloadStream(file[0]._id).
  pipe(fs.createWriteStream('./uploads/'+file[0].filename)).
  on('error', function(error) {
    assert.ifError(error);
  }).
  on('finish', function() {
         
    const extend = '.pdf'
    const enterPath = path.join(__dirname, '../uploads/'+file[0].filename);
    outputPath = path.join(__dirname, '../uploads/'+file[0].filename+extend);
     
    // Read file
    const enterPath2 = fs.readFileSync(enterPath);
    if (file[0].filename.slice(-4)!=".pdf"){
    // Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
    libre.convert(enterPath2, extend, undefined, (err, done) => {
        
        // Here in done you have pdf file which you can save or transfer in another stream
        fs.writeFileSync(outputPath, done);
    });
  }
    
    
  });
resolve()
})}

module.exports = Upload