//Define a User model
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

//Define el formato que tendra cada instancia de un usuario en la base de datos.
//Define schema for Users model
const userSchema = new mongoose.Schema({
  name:{
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true
  },
  email:{
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value){
      if(!validator.isEmail(value))
      throw new Error('Invalid email')
    }
  },
  password:{
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate(value){
      if(value.toLowerCase().includes('password')){
        throw new Error('Password can not contain "password"')
      }
    }
  },
  avatar: {
    type: Buffer
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }

  }]
}, {
  timestamps: true
}//,
//{ autoIndex: true }
)

//userSchema.index({ name: 1, email: 1 }, { unique: true});

//Relación virtual entre usuarios y tareas.
userSchema.virtual('tasks', {
  ref: 'Tasks',
  localField: '_id',
  foreignField: 'owner'
})

/*Hiding Private Data
Este metodo no se llama en ningun lugar. Es utilizado para manipular los objetos JSON.
Se utiliza para ocultar en la respuesta parte de la información de usuario como datos sensibles
Cuando alguien solicite el perfil del usuario, los datos aqui borrados no se enviaran en el json de respuesta pero no desaparecen de la base de datos.
Simplemente se ominten en la respuesta. */
userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

//Define generateAuthToken method for an instance of User schema
/*Este metodo se llama al crear un usuario o loguearse, lo que hace es generar un token
y guardarlo en una matriz en la base de datos para luego autenticar usuarios. */
userSchema.methods.generateAuthToken = async function () {
  const user = this
  //Genera el token a partir de la id y un string aleatorio. Se le puede agregar caducidad.
  const token = jwt.sign({_id: user._id.toString()}, 'randomstring')

  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

//Este motodo se llama al loguearse, lo que hace es devolver la imagen de avatar.
userSchema.methods.returnAvatar = async function () {
  const user = this
  return user.avatar
}

//Define findByCredentials as a method of User schema
//Este metodo se llama solo para el logueo de usuarios.
userSchema.statics.findByCredentials = async (email, pass) => {
  const user = await User.findOne({email})
  if (!user){
    throw new Error('Invalid username or password!')
  }
  const isMatch = await bcrypt.compare(pass, user.password)
  if(!isMatch){
    throw new Error ('Unable to login')
  }
  return user
}

//Define middleware function before save() method
//Hash the plain text password before saving
/*Este middleware se ejecuta previo a cada llamada de user.save()
Se utiliza para encriptar el password. */
userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

//Delete user tasks when a user is removed
/*Este middleware se ejectuta previo a la llamada de user.remove()
  Elimina de la coleccion 'Tasks' de la base de datos task-manager-api, todas las tareas que este usuario tenga asociadas. */
userSchema.pre('remove', async function(next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})

//Define el esquema de usuarios para la coleccion 'Users' de la base task-manager-api 
const User = mongoose.model('Users', userSchema)

module.exports = User