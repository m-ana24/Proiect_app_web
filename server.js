const cors = require('cors')
const express = require('express')
const Sequelize = require('sequelize')
const path = require('path')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'task.db',
    define: {
      timestamps: false
    }
  })


  
  const Task= sequelize.define('task', {
    nameEmployee: {
      type: Sequelize.STRING,
      validate: {
        len: [3, 20]
      }
    },
    nameTask: {
      type: Sequelize.TEXT,
      validate: {
        len: [3, 60]
      }
    },
    critical_condition: {
      type: Sequelize.INTEGER,
      defaultValue:0,
      validate: {
        customValidator(value) {
          if(value<1 && value>5){
            throw new Error("Grad-ul critic este cuprins intre 1 si 5")
          }
        }
      }
  },
  date: Sequelize.DATEONLY
  
  })

  
  sequelize.sync({ alter: true })
  .then(() => {
    console.log('tables created')
  })

const app = express()

app.use(cors())

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url)
  next()
})

app.use(express.static('public'))

app.use(express.json())


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/tasks', async (req, res, next) => {
    try {
      const tasks= await Task.findAll()
      res.status(200).json(tasks)
    } catch (error) {
      next(error)
    }
  })
  
  app.post('/tasks', async (req, res, next) => {
    console.log(req.body)
    try {
      const task = await Task.create(req.body)
      res.status(201).json( task)
    } catch (error) {
      next(error)
    }
  })

  app.get('/tasks/:id', async (req, res, next) => {
    try{
      const task = await Task.findByPk(req.params.id)
      if(task) {
        res.status(200).json(task)
      } else {
        res.status(404).json( {message: 'not found'})
      }
    } catch (error) {
        next(error)
      }
  
  })
  
  app.put('/tasks/:id', async (req, res, next) => {
    try {
      const task = await Task.findByPk(req.params.id)
      if (task) {
        task.nameEmployee = req.body.nameEmployee
        task.nameTask = req.body.nameTask
        task.critical_condition = req.body.critical_condition
        task.date = req.body.date
        await task.save()
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }      
    } catch (error) {
    next(error)
    }
  })

  app.delete('/tasks/:id', async (req, res, next) => {
    try {
      const task = await Task.findByPk(req.params.id)
    
      if (task) {
        await task.destroy()
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }
        
    } catch (error) {
      next(error)
    }
  })

 

  app.use((err, req, res, next) => {
    console.warn(err)
    res.status(500).json({ message: 'server error' })
  })

  PORT=8080
  app.listen(PORT, function(err){
      if (err) console.log("Error in server setup")
      console.log("Server listening on Port", PORT);
  })