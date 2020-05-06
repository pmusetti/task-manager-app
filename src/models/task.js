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
}, 
owner : {
  type: mongoose.Schema.Types.ObjectId,
  required : true, 
  ref: 'User'
}

},
{
  timestamps: true
})
 
const Task = mongoose.model('Tasks', userSchema)

module.exports = Task