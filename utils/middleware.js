const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const requestLogger = (req, res, next) => {
    logger.info('Method: ', req.method)
    logger.info('Path: ', req.path)
    logger.info('Body: ', req.body)
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'Unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
    console.log("Errorname: ", error.name)
    logger.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'Inappropriate ID'})
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).send({ error: 'Invalid token' })
    } else if (error.name === 'TokenExpiredError') {
        return res.status(401).send({ error: 'Token expired' })
    }

    next(error)
}

const tokenExtractor = (req, res, next) => {
    const authorization = req.get('Authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')){
        req.token = authorization.substring(7)
        //console.log("req.token: ", req.token)
    } else {
        req.token = null
    }
    next()
}

const userExtractor = async(req, res, next) => {
    const token = req.token
    if (token === null) {
        req.user = null
    } else {
        logger.info("Token not null")
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const user = await User.findById(decodedToken)
        req.user = user
    }
    next()
}
module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}