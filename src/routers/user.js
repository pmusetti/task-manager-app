const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const routerUser = new express.Router()

//Create new user
routerUser.post('/users',async (req, res) => {
  const newUser = new User(req.body)

  try{
    await newUser.save()
    const token = await newUser.generateAuthToken()
    res.status(201).send({newUser, token})
  }catch(e){
    res.status(400).send(e)
  }
}) 

//Update user data by ID
routerUser.patch('/users/me', auth, async (req,res) => {

  const updates = Object.keys(req.body) //extraigo solo las claves del objeto json que viene en el cuerpo
  const allowedUpdates = ['name', 'password', 'email'] //defino las claves que se pueden modificar
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) //verifico si 
  //alguno de los objetos que se quiere modificar esta dentro de la lista de los permitidos
  //ivValidOperation será TRUE o FALSE
  
  if (!isValidOperation){
    return res.status(400).send({error: 'Invalid Update value'})//devuelvo un error si no hay coincidencias
  }
  
  try {
    
    //se actualizan los datos de usuario
    updates.forEach((update) => req.user[update] = req.body[update])
    
    await req.user.save()  

    //Si no hubo problemas respondo ok y devuelvo el usuario modificado
    res.status(201).send(req.user)
  } catch (e) {
    //Caso contrario devuelvo el error
    res.status(400).send(e)
  }
})

//Login user by credentials
routerUser.post('/users/login', async (req, res) => {
  try {
    const email = req.body.email //obtengo el email que viene en el json
    const pass = req.body.password //obtengo el password que viene en el json
    console.log(email, pass)
    const user = await User.findByCredentials(email, pass) //busco el usuario por email y pass
    const token = await user.generateAuthToken()//genero un token
    res.status(200).send({ user, token }) //devuelvo 200(OK) usuario y token
  } catch (e) {
    console.log(e)
    res.status(500).send({ error: 'Invalid username or password! Try Again' })
  }
})

//Logout user by 
routerUser.post('/users/logout', auth, async (req, res) => {
  
  try {
    //Filtro la lista de tokens para remover el token actual
    //de esta forma el usuario quedara sin permisos pues su token
    //ya no pertenece a la lista de tokens validos
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()

    res.send()
  } catch (e) {
    
    res.status(500).send(e)
    
  }
})

//Logout all sessions
routerUser.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send(e)
  }
})


//Read all users
routerUser.get('/users/me', auth,  async (req, res) => {
  //Cuando recibo esta petición, dentro del encabezado viene el token
  //con el middleware "auth", busco el usuario en particular y lo devuelvo.
  //de esta manera solo devuelvo el usuario concreto y sus datos y no una lista de todos los usuarios y sus datos
  res.send(req.user)

})


//Delete user
routerUser.delete('/users/me', auth, async (req, res) => {
  const _id = req.user._id
  
  try{
  
  await req.user.remove()
  res.status(200).send(req.user)
}catch (e){
  res.status(500).send(e)
}

})

//Upload profile photo
const upload = multer({
  //si la opcion "dest" se declara, el archivo se guardara en la ruta indicada
  //en este caso ./images/avatar
  //En cambio, si esta opcion no se declara, multer pasara el archivo como parametro a la funcion
  // de calback en el metodo post donde es llamada. 

  //dest: 'images/avatar',
  limits: { fileSize: 1000000 },
  fileFilter(req, file, callback){
    if(!file.originalname.match(/\.(jpeg|jpg|png)/)){
      return callback(new Error ('Pleas upload a jpg or png file!'))
    }
    callback(undefined, true)
  }
})

//Upload avatar
routerUser.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 290 }).png().toBuffer()

  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => { //Arrow function to response only with personal msg instead an html document 
  res.status(400).send( {error: error.message})
})


//Delete avatar
routerUser.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(400).send({error: 'No posible!'})
  }
})

routerUser.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user || !user.avatar){
      throw new Error('no se puede mostrar')
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)

  } catch (e) {
    res.status(404).send()
  }
})




module.exports = routerUser



// //Read single user by ID
// routerUser.get('/users/:id', async (req, res) => {
//   const _id = req.params.id
//   try {
//     const user = await User.findById(_id)
//     if (!user){
//       res.status(404).send({error: 'User Not Found!'})
//     }
//     res.status(201).send(user)
//   } catch (e) {
//     res.status(500).send(e)
//   }
// })
