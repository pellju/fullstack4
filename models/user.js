const mongoose = require('mongoose')
const mongooseValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    name: String,
    hashedPassword: String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.hashedPassword //!
    }
})

userSchema.plugin(mongooseValidator)

const User = mongoose.model('User', userSchema)

module.exports = User