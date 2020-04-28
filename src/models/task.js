//Define a Task model
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({description:{
  type: String,
  trim: true,
  required: true
},
completed:{
  type: Boolean,
  default: false
}})

const Task = mongoose.model('Tasks', userSchema)

module.exports = Task