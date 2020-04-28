const express = require('express')
const Task = require('../models/task')
const routerTask = new express.Router()

//Create new Task
routerTask.post('/tasks', async (req,res) => {
  const newTask = new Task(req.body)

  try {
    await newTask.save()
    res.status(201).send(newTask)
  } catch (e) {
    res.status(400).send(e)
  }
})

//Update task by ID
routerTask.patch('/tasks/:id', async (req, res) => {
  const _id = req.params.id
  const data = req.body
  const updates = Object.keys(data)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  
  if (!isValidOperation){
    return res.status(404).send({error: 'Invalid updates values!'})
  }

  try {
    const task = await Task.findById(_id)
    updates.forEach((update) => task[update]= data[update] )
    await task.save()
    
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})


//Read all tasks
routerTask.get('/tasks', async (req, res) => {

  try {
    const tasks = await Task.find({})
    res.status(201).send(tasks)
  } catch (e) {
    res.status(500).send(e)
  }
})

//Read single task by ID
routerTask.get('/tasks/:id', async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findById(_id)
    if (!task){
      res.status(404).send({error: 'Task Not Found!'})
    }
    res.status(201).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

routerTask.delete('/tasks/:id', async (req, res) => {
  const _id = req.params.id
  
  try{
  const task = await Task.findByIdAndDelete(_id)
  if (!task){
    return res.status(404).send({error: 'Invalid task ID'})
  }
  res.status(201).send(task)
}catch (e){
  res.status(500).send(e)
}

})

module.exports = routerTask