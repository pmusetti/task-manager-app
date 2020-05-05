const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {

  try {
    const token = req.header('Authorization').replace('Bearer ', '')//quito el principio del encabezado para quedarme con el token puro
    const decoded = jwt.verify(token, 'randomstring')//verifico el token con la cadena que lo genero
    //console.log("token verificado : " , decoded)
    //Encuentro el usuario con la id dada y que tenga el token registrado
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    //Si no encuentro el usuario lanzo un error
    if (!user){
      throw new Error('error')
    }

    //Devuelvo el usuario y todos sus datos
    req.user = user
    //Devuelvo también el token actual para poder gestionar el logout
    req.token = token
    
  
    next()
  } catch (e) {
    res.status(401).send({error: 'Please authenticate!'})
  }
}

module.exports = auth
