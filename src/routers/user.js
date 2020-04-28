const express = require('express')
const User = require('../models/user')
const routerUser = new express.Router()

//Create new user
routerUser.post('/users',async (req, res) => {
  const newUser = new User(req.body)

  try{
    await newUser.save()
    res.status(201).send(newUser)
  }catch(e){
    res.status(400).send(e)
  }
}) 

//Update user data by ID
routerUser.patch('/users/:id', async (req,res) => {
  const _id = req.params.id 
  const data = req.body
  const updates = Object.keys(data)
  const allowedUpdates = ['name', 'password', 'email']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation){
    return res.status(400).send({error: 'Invalid Update value'})
  }

  try {

    const user = await User.findById(_id)

    updates.forEach((update) => user[update] = data[update])
    console.log(user)
    await user.save()  

    if (!user){
      return res.status(404).send({error: 'Could not be update!'})
    }
    res.status(201).send(user)
  } catch (e) {
    res.status(400).send(e)
  }
})

//Login user by credentials
routerUser.post('/users/login', async (req, res) => {
  try {
    const email = req.body.email 
    const pass = req.body.password
    console.log(email, pass)
    const user = await User.findByCredentials(email, pass)
    res.status(201).send(user)
  } catch (e) {
    console.log(e)
    res.status(500).send({error: 'Invalid username or password! Try Again'})
  }
})

//Read all users
routerUser.get('/users', async (req, res) => {

  try {
    const users = await User.find({})
    res.send(users)
  } catch (e) {
    res.status(500).send(e)
  }
})

//Read single user by ID
routerUser.get('/users/:id', async (req, res) => {
  const _id = req.params.id
  try {
    const user = await User.findById(_id)
    if (!user){
      res.status(404).send({error: 'User Not Found!'})
    }
    res.status(201).send(user)
  } catch (e) {
    res.status(500).send(e)
  }
})

//Delete user by ID
routerUser.delete('/users/:id', async (req, res) => {
  const _id = req.params.id
  
  try{
  const user = await User.findByIdAndDelete(_id)
  if (!user){
    return res.status(404).send({error: 'Invalid user ID'})
  }
  res.status(201).send(user)
}catch (e){
  res.status(500).send(e)
}

})

module.exports = routerUser