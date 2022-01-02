const Blog = require('../models/blog')
const router = require('express').Router()
const logger = require('../utils/logger')

router.get('/', (req, res) => {
  res.send('Well, the bottomline is this: Everything is conscious.')
})

router.get('/blogs', (request, response) => {
    Blog
      .find({})
      .then(blogs => {
        logger.info(blogs)
        response.json(blogs)
      })
  })
  
router.post('/blogs', (request, response) => {
    const blog = new Blog(request.body)
  
    blog
      .save()
      .then(result => {
        response.status(201).json(result)
      })
})
  
module.exports = router