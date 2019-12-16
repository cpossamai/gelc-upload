const dotenv = require('dotenv')
dotenv.config()
const mongodb = require('mongodb')

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
  if (err) {
    console.error('An error occurred connecting to MongoDB: ', err);
} else {module.exports = client
  const app = require('./app')
  app.listen(process.env.PORT)
}})
