import Post from '../models/communityBoard.mjs'

export const CommunityBoardController = {
  // Display all posts on the community board
  getPosts: async (req, res) => {
    try {
      const posts = await Post.find().sort({
        createdAt: -1
      }) // Get all posts, newest first
      res.render('community-board', {
        posts,
        user: req.session.user
      })
    } catch (error) {
      console.error('Error fetching posts:', error)
      res.status(500).send('Error loading community board')
    }
  },

  // Handle submission of a new post
  addPost: async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login')
    }

    const { content } = req.body
    if (containsProhibitedWords(content)) {
      req.session.flashMessage = 'Your post contains prohibited content and cannot be published.'
      return res.redirect('/community-board') // Redirect to the board where the message should be shown
    }

    try {
      const newPost = new Post({
        content,
        username: req.session.user.username,
        date: new Date()
      })
      await newPost.save()
      res.redirect('/community-board')
    } catch (error) {
      console.error('Failed to add post:', error)
      res.status(500).send('Failed to add your post.')
    }
  },

  // Update existing post
  updatePost: async (req, res) => {
    const {
      id
    } = req.params
    const {
      content
    } = req.body
    try {
      const post = await Post.findById(id)
      if (!post) {
        return res.status(404).send('Post not found')
      }
      if (post.username !== req.session.user.username) {
        return res.status(403).send('You can only edit your own posts')
      }
      post.content = content
      await post.save()
      res.redirect('/community-board')
    } catch (error) {
      console.error('Failed to update post:', error)
      res.status(500).send('Failed to update the post.')
    }
  },

  // Delete a post
  deletePost: async (req, res) => {
    const {
      id
    } = req.params
    try {
      const post = await Post.findById(id)
      if (!post) {
        return res.status(404).send('Post not found')
      }
      if (post.username !== req.session.user.username) {
        return res.status(403).send('You can only delete your own posts')
      }
      await Post.findByIdAndDelete(id)
      res.redirect('/community-board')
    } catch (error) {
      console.error('Failed to delete post:', error)
      res.status(500).send('Failed to delete the post.')
    }
  },
  // Function to add a reply to a post
  addReply: async (req, res) => {
    const { id } = req.params
    const { content } = req.body

    if (!req.session.user) {
      return res.redirect('/login')
    }

    if (containsProhibitedWords(content)) {
      req.session.flashMessage = 'Your reply contains prohibited content and cannot be published.'
      return res.redirect('/community-board') // Redirect to the board where the message should be shown
    }

    try {
      const post = await Post.findById(id)
      if (!post) {
        return res.status(404).send('Post not found')
      }

      const newReply = {
        content,
        username: req.session.user.username,
        date: new Date()
      }

      post.replies.push(newReply)
      await post.save()
      res.redirect('/community-board')
    } catch (error) {
      console.error('Failed to add reply:', error)
      res.status(500).send('Failed to add reply.')
    }
  },

  // Function to delete a reply to a post
  deleteReply: async (req, res) => {
    const { postId, replyId } = req.params

    try {
      const post = await Post.findById(postId)
      if (!post) {
        return res.status(404).send('Post not found')
      }

      // Check if the current user is the owner of the post or the reply
      const replyIndex = post.replies.findIndex(reply => reply._id.toString() === replyId)
      if (replyIndex === -1) {
        return res.status(404).send('Reply not found')
      }

      const reply = post.replies[replyIndex]
      if (req.session.user.username !== reply.username && req.session.user.username !== post.username) {
        return res.status(403).send('You can only delete your own replies or replies on your post')
      }

      // Remove the reply from the array
      post.replies.splice(replyIndex, 1)
      await post.save()
      res.redirect('/community-board')
    } catch (error) {
      console.error('Failed to delete reply:', error)
      res.status(500).send('Failed to delete the reply.')
    }
  }

}

// Example list of prohibited keywords
const prohibitedKeywords = ['fuck', 'ass', 'asshole', 'shit', 'shity']

/**
 * Checks if the given text contains any prohibited words defined in `prohibitedKeywords`.
 * This function is case-insensitive and ensures that the matches are whole words.
 * @param {string} text The text to check for prohibited words.
 * @returns {boolean} Returns `true` if the text contains any of the prohibited words, otherwise `false`.
 */
function containsProhibitedWords (text) {
  const regex = new RegExp('\\b(' + prohibitedKeywords.join('|') + ')\\b', 'i')
  return regex.test(text)
}
