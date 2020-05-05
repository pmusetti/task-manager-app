//Define a User model
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//Define schema for Users model
const userSchema = new mongoose.Schema({
  name:{
    type: String,
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
  tokens: [{
    token: {
      type: String,
      required: true
    }

  }]
})

//Hiding Private Data
//Este metodo no se llama en ningun lugar. Es utilizado para manipular los objetos JSON.
//En este caso lo utilizamos para ocultar parte de la información de usuario como datos sensible
//para luego enviar el objeto sin estos datos al cliente.
userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens

  return userObject
}

//Define generateAuthToken method for a instance of User schema
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({_id: user._id.toString()}, 'randomstring')

  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

//Define findByCredentials as a method of User schema
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
userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')){

    user.password = await bcrypt.hash(user.password, 8)

  }
  next()
})

const User = mongoose.model('Users', userSchema)

module.exports = User