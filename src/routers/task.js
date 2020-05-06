const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const routerTask = new express.Router()

//Create new Task
routerTask.post('/tasks', auth,  async (req,res) => {
  //Crea una copia del body de la solicitud y le agrega un elemento que sera la ID del usuraio qu ela creo
  //esta ID no vino en el cuerpo, pero la obtendremos con el middleware auth
  const newTask = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await newTask.save()
    res.status(201).send(newTask)
  } catch (e) {
    res.status(400).send(e)
  }
})

//Update task by ID
routerTask.patch('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  const data = req.body
  const updates = Object.keys(data)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  
  if (!isValidOperation){
    return res.status(404).send({error: 'Invalid updates values!'})
  }

  try {
    const task = await Task.findOne({_id, owner: req.user._id})
    if (!task) {
      return res.status(404).send('Task not found')
    }
    updates.forEach((update) => task[update]= data[update] )
    await task.save()
    
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})


//Read all tasks
routerTask.get('/tasks', auth, async (req, res) => {

  try {
    const tasks = await Task.find({owner: req.user._id})//Encuentra todas las tareas creadas por el usuario logueado
    res.status(201).send(tasks)
  } catch (e) {
    res.status(500).send(e)
  }
})

//Read single task by ID
routerTask.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({_id, owner: req.user._id})//Encuentra la tarea por su id, solo si el usuario logueado fue quien la creo.
    if (!task){
      res.status(404).send({error: 'Task Not Found!'})
    }
    res.status(201).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

//Delete task by id
routerTask.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  
  try{
  const task = await Task.findOneAndDelete({_id, owner: req.user._id})
  if (!task){
    return res.status(404).send({error: 'Invalid task ID'})
  }
  res.status(201).send(task)
}catch (e){
  res.status(500).send(e)
}

})

module.exports = routerTask