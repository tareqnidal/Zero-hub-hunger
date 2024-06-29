import mongoose from 'mongoose'
const { Schema } = mongoose

const replySchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

const postSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  replies: [replySchema] // Nested replies
})

const Post = mongoose.model('Post', postSchema)
export default Post
