const multer = require('multer')
//Upload profile photo
const upload = multer({
  //si la opcion "dest" se declara, el archivo se guardara en la ruta indicada
  //En cambio, si esta opcion no se declara, multer pasara el archivo como parametro a la funcion
  // de calback en el metodo post donde es llamada. 
  //dest: 'images/avatar',
  limits: { fileSize: 1000000 }, //limite de tamaño en bytes
  fileFilter(req, file, callback){//define el tipo de archivo admitido
    if(!file.originalname.match(/\.(jpeg|jpg|png)/)){
      return callback(new Error ('Pleas upload a jpg or png file!'))
    }
    callback(undefined, true)
  }
})

module.exports = upload