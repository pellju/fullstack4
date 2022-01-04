const brypt = require('bcrypt')
const router = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

router.post('/', async (req, res) => {
    const body = req.body

    if (body.password === undefined || body.username === undefined){
        return res.status(400).send({ error: "Username or password not defined" })
    } else if (body.password.length < 3 || body.username.length < 3){
        return res.status(400).send({ error: "Username or password too short (min 3 characters)!"})
    }

    const passwordHash = await bcrypt.hash(body.password, 10)
    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash
    })

    const savedUser = await user.save()
    res.json(savedUser)

})

router.get('/', async(req,res) => {
    const users = await User.find({}).populate('blogs')
    res.json(users.map(u => u.toJSON()))
})

module.exports = router