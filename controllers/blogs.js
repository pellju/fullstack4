const { AggregationCursor } = require('mongoose')
const Logger = require('nodemon/lib/utils/log')
const blog = require('../models/blog')
const Blog = require('../models/blog')
const router = require('express').Router()
const logger = require('../utils/logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

router.get('/', (req, res) => {
  res.send('Well, the bottomline is this: Everything is conscious.')
})

router.get('/blogs', (request, response) => {
    Blog
      .find({})
      .populate('users')
      .then(blogs => {
        logger.info("Blogs: ")
        logger.info(blogs)
        response.json(blogs)
      })
  })
  
router.post('/blogs', async(request, response) => {
    const body = request.body
    const token = request.token
    //logger.info("Token:", token)
    if (!token || token === null){
      logger.info("Nullified user: ", request.user)
      return response.status(401).json({ error: 'Missing or invalid token' })
    }

    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (body.title === undefined || body.url === undefined) {
      return response.status(400).send({ error: "Title, url or userid missing" })
    } else if (!decodedToken) {
      return response.status(401).send({ error: "Missing or invalid token (2)" })
    }

    const user = await User.findById(decodedToken.id)
    //logger.info(user)
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      users: user._id
    })
    
    if (blog.likes === undefined) {
      blog.likes = 0
    }
    const savedBlog = await blog.save()
    //logger.info(user)
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog.toJSON())
})

router.delete('/blogs/:id', async(request, response) => {
  const id = request.params.id
  const token = request.token

  if (!token || token === null) {
    return response.status(401).send({error: 'Missing or invalid token' })
  }
  const decodedToken = jwt.verify(token, process.env.SECRET)

  const blogs = await Blog.find({})
  const wantedBlog = blogs.find(blog => blog.id === id)
  if (wantedBlog === undefined) {
    return response.status(400).send({error: "ID not found"})
  }

  const postedUserId = wantedBlog.users[0]
  //logger.info("decodedToken.id: ", decodedToken.id, " postedUsed._id.toString(): ", postedUserId.toString())
  
  if (decodedToken.id === postedUserId.toString()){
    
    await blogs[blogs.indexOf(wantedBlog)].remove()
    const user = await User.findById(postedUserId)
    user.blogs.splice(user.blogs.indexOf(wantedBlog.id.toString()), 1)
    logger.info("Blog removed.")
    return response.status(200).json(await Blog.find({}))
  
  } else {
    return response.status(401).send({ error: 'Unauthorized action' })
  }
})

router.put('/blogs/:id', async(request, response) => {
  const id = request.params.id
  const body = request.body
  //console.log(body)

  const blogs = await Blog.find({})
  const wantedBlog = blogs.find(blog => blog.id === id)

  if (wantedBlog == undefined) {
    return response.status(400).send({ error: "ID not found"})
  } else {
    const user = await User.findById(wantedBlog.users[0])
    const updatedBlog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      users: user._id
    }

    if (updatedBlog.title === undefined){
      updatedBlog.title = wantedBlog.title
    }

    if (updatedBlog.author === undefined){
      updatedBlog.author == wantedBlog.author
    }

    if (updatedBlog.url === undefined){
      updatedBlog.url = wantedBlog.url
    }

    if (updatedBlog.likes === undefined){
      updatedBlog.likes == wantedBlog.likes
    }
    logger.info("updated blog:")
    logger.info(updatedBlog)
    const res = await Blog.findByIdAndUpdate(id, updatedBlog, { new: true })
    return response.status(200).send(await Blog.find({}))
  }

})
  
module.exports = router