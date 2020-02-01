const courseCollection = require('../db').db().collection("courses")
const ObjectID = require('mongodb').ObjectID

let Course = function(courseId, courseName) {
    console.log(courseId)
    console.log(courseName)
    this.courseId = courseId
    this.courseName = courseName
}

Course.CoursesToArray = function (){
  return new Promise((resolve, reject)=>{
    courseCollection.find().toArray().then((courses)=>{
      resolve(courses)
    }).catch((e)=>{
      reject(e)
    })
  })
}

    
Course.prototype.cleanup = function(){
    try{
        if (typeof(this.courseId) != "string") {this.courseId = ""}
        if (typeof(this.courseName) != "string") {this.courseName = ""}
        // get rid of any bogus properties
        this.courseId=this.courseId.trim()
        this.courseName=this.courseName.trim()
                  
      }catch(e){
        console.log("error in Course.cleanup",e)
      }
}




Course.prototype.addCourse = function(){
    this.cleanup()
    return new Promise((resolve,reject)=>{
    courseCollection.insertOne({CourseId:this.courseId, CourseName: this.courseName}).then(()=>{
      resolve()
    }).catch((e)=>{
      console.log("Course.addCourse",e)
      reject(e)
    })
    })}

    Course.updateCourse = function (id, courseId, courseName) {
      return new Promise((resolve,reject)=>{
      courseCollection.findOneAndUpdate({ _id: new ObjectID(id) }, { $set: { CourseId: courseId , CourseName: courseName } }).then(()=>{
        resolve()
      }).catch((e)=>{
        console.log("course.updateCourse",e)
        reject(e)
      })
    })}
    
    Course.deleteCourse = function (id) {
      return new Promise((resolve,reject)=>{
      courseCollection.deleteOne({ _id: new ObjectID(id) }).then(()=>{
        resolve()
      }).catch((e)=>{
        console.log("course.deleteCourse",e)
        reject(e)})
    })}

module.exports = Course
