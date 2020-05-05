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


app.listen(port, () => {
  console.log('Server running in port ' + port)
})


// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//   const token = jwt.sign({ _id: 'abc123'}, 'randDoMstring', { expiresIn: '7 days'})
//   console.log(token) 

//   const data = jwt.verify(token, 'randDoMstring')
//   console.log(data)
// }

// //myFunction()