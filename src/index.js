const express = require('express')
require('./db/mongoose')
const routerUser = require('./routers/user')
const routerTask = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

//without middelware: new request -> run route handler
//
//with middelware:    new request -> do something like check jwt -> run route handler



app.use(express.json())

app.use(routerUser)

app.use(routerTask)



// Upload file to server
const multer = require('multer')
const upload = multer({
  dest: 'images', //folder destination
  limits: {
    fileSize: 1000000 //size limit in bytes
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(doc|docx)$/)){
      return callback(new Error ('Pease upload a Word Document'))
    }
    callback(undefined, true)
    // callback(new Error('File must be a PDF'))
    // callback(undefined, true)
    // callback(undefined, false)
  }
})




app.listen(port, () => {
  console.log('Server running in port ' + port)
})





// const User = require('./models/user')

// const main  = async () => {
//   const user = await User.findById('5eb1dd76e2c782126db24a23')
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks)
// }

// main()

// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//   const token = jwt.sign({ _id: 'abc123'}, 'randDoMstring', { expiresIn: '7 days'})
//   console.log(token) 

//   const data = jwt.verify(token, 'randDoMstring')
//   console.log(data)
// }

// //myFunction()


//// Upload file to server
// const multer = require('multer')
// const upload = multer({
//   dest: 'images', //folder destination
//   limits: {
//     fileSize: 1000000 //size limit in bytes
//   },
//   fileFilter(req, file, callback) {
//     if (!file.originalname.endsWith('.pdf')){
//       return callback(new Error ('Pease upload a PDF'))
//     }
//     callback(undefined, true)
//     // callback(new Error('File must be a PDF'))
//     // callback(undefined, true)
//     // callback(undefined, false)
//   }
// })

// app.post('/upload', upload.single('upload'), (req, res) => {
//   res.send()
// })
