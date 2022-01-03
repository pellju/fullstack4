require('dotenv').config()

let mongoUrl = null

if (process.env.NODE_ENV === 'test') {
    mongoUrl = process.env.TEST_MONGODB_URI
} else {
    mongoUrl = process.env.MONGODB_URI
}

const PORT = process.env.PORT

module.exports = {
    mongoUrl,
    PORT
}