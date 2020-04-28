//Create a connection with mongodb database task-manager-api
const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api',{
  useUnifiedTopology: true,
  useCreateIndex: true,
  useNewUrlParser: true
})