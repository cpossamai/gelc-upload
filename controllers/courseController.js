
const Course = require('../models/Course')


exports.displayCourses = function (req, res) {
  Course.CoursesToArray().then((courses)=> {
    console.log(courses)
    res.render('addCourses', { courses: courses })
  }).catch((e)=>{
    console.log(e)
  })
}


exports.addContent = function(req,res){
  res.render(404)
}

exports.addCourse = function (req, res,next) {
  console.log(req.body.courseId)
  console.log(req.body.courseName)
  course = new Course(req.body.courseId, req.body.courseName)
  course.addCourse().then(()=>
  {
    console.log("Success")
    next()
  }).catch((e)=>{
    console.log("failed")
  })
  
}

exports.updateCourse = function (req, res,next) {
  Course.updateCourse(req.params.id, req.body.courseId, req.body.courseName).then(()=>
  {
    console.log("Success")
    next()
  }).catch((e)=>{
    console.log("failed")
  })
  }

exports.deleteCourse = function (req,res,next) {
  console.log("req.params.id: ",req.params.id)
  Course.deleteCourse(req.params.id).then(()=>
  {
    
    console.log("Success")
    next()
  }).catch((e)=>{
    console.log("failed")
  })
}

