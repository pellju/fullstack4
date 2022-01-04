const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)

const blogs = [
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    blogs.forEach(async (blog) => {
        let newBlog = new Blog(blog)
        newBlog.save()
    })
})

test('Testing that the amount of /api/blogs equals to the amount of example blogs (ex. 4.8.)', async () => {
    const correctNumber = blogs.length
    const response = await api.get('/api/blogs').expect('Content-Type', /application\/json/)
    expect(response.body).toHaveLength(correctNumber)
})

test ('Testing that blogs have "id"-tag (_id in examples, ex. 4.9.)', async() => {
    const response = await api.get('/api/blogs').expect('Content-Type', /application\/json/)
    expect(response.body[0].id).toBeDefined() //Check if valid or not
})

test ('Adding new blog using POST-request works (ex. 4.10.)', async() => {
    const newBlog = {
        _id: "5a422aa71b54a676234d17f9",
        title: "Testiblogi",
        author: "Mievaan",
        url: "https://www.duckduckgo.com",
        likes: 8,
        __v: 0
    }
    const amountOfBlogs = blogs.length + 1
    await api.post('/api/blogs').send(newBlog).expect(201).expect('Content-Type', /application\/json/)
    const responseForGet = await api.get('/api/blogs').expect('Content-Type', /application\/json/)
    expect(responseForGet.body.includes('5a422aa71b54a676234d17f9'))
    expect(responseForGet.body).toHaveLength(amountOfBlogs)
})

test ('If like-parameter is undefined, blog will be created with zero likes (ex. 4.11.)', async () => {
    const newBlog = {
        _id: "5a422aa71b54a676234d17fa",
        title: "Uusi blogi",
        author: "Mievaan",
        url: "https://www.duckduckgo.com",
        __v: 0 
    }

    await api.post('/api/blogs').send(newBlog).expect(201).expect('Content-Type', /application\/json/)
    const responseForGet = await api.get('/api/blogs').expect('Content-Type', /application\/json/)
    let likesInTheBlog = -1
    responseForGet.body.forEach(blog => {
        if (blog.id === '5a422aa71b54a676234d17fa'){
            likesInTheBlog = blog.likes
        }
    })

    expect(likesInTheBlog).toEqual(0)
})

test ('If title or url is missing when adding new blog, returning 401 (ex. 4.12.)', async() => {
    const blogMissingTitle = {
        _id: "5a422aa71b54a676234d17fb",
        author: "Mievaan",
        url: "https://www.duckduckgo.com",
        __v: 0 
    }

    const blogMissingUrl = {
        _id: "5a422aa71b54a676234d17fb",
        title: "testiblogi3",
        author: "Mievaan",
        __v: 0 
    }

    await api.post('/api/blogs').send(blogMissingTitle).expect(400).expect('Content-Type', /application\/json/)
    await api.post('/api/blogs').send(blogMissingUrl).expect(400).expect('Content-Type', /application\/json/)
})

test ('If deleting blog works correctly (ex. 4.13.)', async() => {
    const newBlog = {
        _id: "5a422aa71b54a676234d17fd",
        title: "Blogi Mikä Poistetaan",
        author: "Mievaan",
        url: "https://www.duckduckgo.com",
        __v: 0 
    }
    await api.post('/api/blogs').send(newBlog).expect(201).expect('Content-Type', /application\/json/)
    await api.delete('/api/blogs/5a422aa71b54a676234d17fd').expect(200).expect('Content-Type', /application\/json/)
    const afterRemoval = await api.get('/api/blogs').expect('Content-Type', /application\/json/)
    const isRemovedBlogIncluded = afterRemoval.body.includes('5a422aa71b54a676234d17fd')
    expect(isRemovedBlogIncluded).toEqual(false)
})

test ('If password/username is shorter than 3 characters or they are not defined (ex. 4.16)', async () => {
    const missingUsernameAndPassword = {
        name: "Tauno Testaaja"
    }

    const userWithTooShartUsernameAndPassword = {
        username: "tt",
        name: "Tero Testaaja",
        password: "k"
    }

    const properUser = {
        username: "tanja",
        name: "Tanja Testaaja",
        password: "123456"
    }

    await api.post('/api/users').send(missingUsernameAndPassword).expect(400).expect('Content-Type', /application\/json/)
    await api.post('/api/users').send(userWithTooShartUsernameAndPassword).expect(400).expect('Content-Type', /application\/json/)
    await api.post('/api/users').send(properUser).expect(200).expect('Content-Type', /application\/json/)
})

afterAll(async () => {
    mongoose.connection.close()
})