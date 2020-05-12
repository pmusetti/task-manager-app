const express = require('express')
const upload = require('../utils/upload')
const sharp = require('sharp')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const routerTask = new express.Router()

//Create new Task
routerTask.post('/tasks', auth,  async (req,res) => {
  //Crea una copia del JSON de la solicitud y le agrega un elemento 'key:value' que sera la ID del usuario que la creo
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
//Actualiza un task segun su id. No la id de usuario sino la id de la task
//Esta id viene en la url
routerTask.patch('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  const data = req.body
  const updates = Object.keys(data)//Extraigo las claves del JSON de la solicitud
  const allowedUpdates = ['description', 'completed'] //Creo una matriz con las claves que se permiten modificar
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))//Si alguna clave coincide con las claves permitidas, la operacion es valida.
  
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

//Upload image
routerTask.post('/tasks/:id/image', auth, upload.single('image'), async (req, res) => {
  const _id = req.params.id
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 290 }).png().toBuffer() 
  try {
    
    const task = await Task.findOne({_id, owner: req.user.id})
    if (!task) {
      return res.status(404).send('Task not found')
    }
    
    task.image = buffer
    await task.save()
    res.status(200).send()
  } catch (e) {
    res.status(404).send()
  }
})


//Read tasks filtered & pagination
//GET/tasks?completed=true
//GET/tasks?limit=2&skip=7
//GET/tasks?sortBy=createdAt:desc
//El usuario puede hacer una busqueda de tareas con diferentes criterios
//Ver solo tareas completas, o incompletas, ordenadas por orden ascendente o descendente de creacion.
//Puede elegir tambien cuantas ver por cada solicitud y a partir de cual indice.(Paginacion)
routerTask.get('/tasks', auth, async (req, res) => {
  const criteria = {owner: req.user._id}//El primer criterio es que pertenezcan al usuario logueado
  const limit = parseInt(req.query.limit)//Limite de resultados a devolver que viene en la url
  const skip = parseInt(req.query.skip)//offset de los resultados a traer que viene en la url
  const sort = {} //define orden ascendente o descendente
  if (req.query.sortBy){
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] =  parts[1] === 'desc' ? -1 : 1
  }
  
  if (req.query.completed){
    criteria.completed = req.query.completed === 'true'
  }
  try {
    const tasks = await Task.find(criteria)
    .limit(limit)
    .skip(skip)
    .sort(sort)

    res.status(200).send(tasks)
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