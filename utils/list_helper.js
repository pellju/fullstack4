const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const amountOfLikes = (likeSum, blog) => {
        return likeSum + blog.likes
    }

    return blogs.reduce(amountOfLikes, 0)
}

const favoriteBlog = (blogs) => {
    let mostLikedBlog = null
    const checkIfBlogIsMoreFavorite = (mostLiked, blog) => {
        if (blog.likes > mostLiked) {
            mostLikedBlog = blog
            mostLiked = blog.likes
        }
        return mostLiked
    }

    blogs.reduce(checkIfBlogIsMoreFavorite, 0)
    return mostLikedBlog
}

const mostBlogs = (blogs) => {
    let authorWithMostBlogs = ''
    let mostBlogsWritten = 0
    const writersAndAmounts = _.groupBy(blogs, 'author')
    //console.log(writersAndAmounts)
    for (const [author, blogs] of Object.entries(writersAndAmounts)) {
        if (blogs.length > mostBlogsWritten) {
            authorWithMostBlogs = author
            mostBlogsWritten = blogs.length
        }
    }
    
    const personWithMostBlogs = {
        author: authorWithMostBlogs,
        blogs: mostBlogsWritten
    }
    return personWithMostBlogs
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}