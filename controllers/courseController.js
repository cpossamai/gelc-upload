const courseCollection = require('../db').db().collection("courses")


exports.displayCourses = function (req, res) {
  courseCollection('courses').find().toArray(function (err, courses) {
    res.render('addCourses', { courses: courses })
  })
}



exports.addCourse = function (req, res) {
  course=new Course(req.body.courseId, req.body.courseName)
  course.addCourse()
  
}

exports.updateCourse = function (req, res) {
  courseCollection('courses').findOneAndUpdate({ _id: new mongodb.ObjectId(req.body.id) }, { $set: { text: req.body.text } }, function () {
    console.log("Success")
  })
}

exports.deleteCourse = function (req, res) {
  courseCollection('courses').deleteOne({ _id: new mongodb.ObjectId(req.body.id) }, function () {
    console.log("Success")
  })
}

