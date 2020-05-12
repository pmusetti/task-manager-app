const mongoose = require('mongoose')
//Define el modelo de la coleccion Tasks de la base de datos task-manager-api
const userSchema = new mongoose.Schema({
  
  description:{
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
},
image : {
  type: Buffer
}
},
{
  timestamps: true
})

const Task = mongoose.model('Tasks', userSchema)

module.exports = Task