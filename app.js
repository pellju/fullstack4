const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const router = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const userRegistration = require('./controllers/users')
const userLogin = require('./controllers/login')
const testingPreparations = require('./controllers/testing')
//logger.info('Connecting to:', config.mongoUrl)

mongoose.connect(config.mongoUrl)
    .then(() => logger.info('Connected to Mongodb'))
    .catch(e => logger.error(e))

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api', router)
app.use('/api/users', userRegistration)
app.use('/api/login', userLogin)

if (process.env.NODE_ENV === 'test') {
    app.use('/api/testing', testingPreparations)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app