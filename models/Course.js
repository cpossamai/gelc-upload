const courseCollection = require('../db').db().collection("courses")

let Course = function(data) {
    this.data.courseId = data.courseId
    this.data.courseName = data.courseName
}
    
Course.prototype.cleanup = function(){
    try{
        if (typeof(this.data.courseId) != "string") {this.data.courseId = ""}
        if (typeof(this.data.courseName) != "string") {this.data.courseName = ""}
        // get rid of any bogus properties
        this.data = {
         courseId: this.data.courseId.trim(),
          courseName: this.data.courseName.trim(),
                  }
      }catch(e){
        console.log("error in Course.cleanup",e)
      }
}


    

Course.prototype.addCourse = function(){
    this.cleanup()
    await courseCollection.insertOne(this.data)
    }

module.exports = Course
