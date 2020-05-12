const express = require('express')
var cors = require('cors')
require('./db/mongoose')
const routerUser = require('./controllers/user')
const routerTask = require('./controllers/task')

const app = express()

const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json())//Express builtin middleware to recognize incoming Request Object as a JSON Object.
app.use(routerUser)//Custom module for handle users requests
app.use(routerTask)//Custom modulo for handle tasks request

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
