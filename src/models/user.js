//Define a User model
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

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

  }
})

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

userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')){

    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

const User = mongoose.model('Users', userSchema)

module.exports = User