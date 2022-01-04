const { AggregationCursor } = require('mongoose')
const Logger = require('nodemon/lib/utils/log')
const blog = require('../models/blog')
const Blog = require('../models/blog')
const router = require('express').Router()
const logger = require('../utils/logger')
const User = require('../models/user')

router.get('/', (req, res) => {
  res.send('Well, the bottomline is this: Everything is conscious.')
})

router.get('/blogs', (request, response) => {
    Blog
      .find({})
      .populate('users')
      .then(blogs => {
        //logger.info(blogs)
        response.json(blogs)
      })
  })
  
router.post('/blogs', async(request, response) => {
    const body = request.body
    //logger.info(body)

    if (body.title === undefined || body.url === undefined || body.userId === undefined) {
      return response.status(400).send({ error: "Title, url or userid missing" })
    }

    const user = await User.findById(body.userId)
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

  const blogs = await Blog.find({})
  const wantedBlog = blogs.find(blog => blog.id === id)

  //logger.info("wantedBlog: ", wantedBlog)

  if (wantedBlog === undefined) {
    return response.status(400).send({error: "ID not found"})
  } else {
    await blogs[blogs.indexOf(wantedBlog)].remove()
    response.status(200).json(await Blog.find({}))
  }
})

router.put('/blogs/:id', async(request, response) => {
  const id = request.params.id
  const body = request.body
  console.log(body)

  const blogs = await Blog.find({})
  const wantedBlog = blogs.find(blog => blog.id === id)

  if (wantedBlog == undefined) {
    return response.status(400).send({ error: "ID not found"})
  } else {
    const updatedBlog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
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
    //logger.info("updatedBlog= ", updatedBlog)
    await Blog.updateOne({id: id}, updatedBlog)
    return response.status(200).send(await Blog.find({}))
  }

})
  
module.exports = router