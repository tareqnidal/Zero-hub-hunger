import Post from '../models/communityBoard.mjs'

export const sessionHandler = {}

sessionHandler.home = (req, res) => {
  // check if there is an error message in previous operations
  const flashMessage = req.session.flashMessage ?? null
  const user = req.session.user ?? null
  req.session.flashMessage = null
  res.render('home', {
    user,
    flashMessage
  })
}

sessionHandler.info = (req, res) => {
  // check if there is an error message in previous operations
  const flashMessage = req.session.flashMessage ?? null
  const user = req.session.user ?? null
  req.session.flashMessage = null
  res.render('info-page', {
    user,
    flashMessage
  })
}

sessionHandler.eduRec = (req, res) => {
  // check if there is an error message in previous operations
  const flashMessage = req.session.flashMessage ?? null
  const user = req.session.user ?? null
  req.session.flashMessage = null
  res.render('edu-rec', {
    user,
    flashMessage
  })
}

sessionHandler.communityBoard = async (req, res) => {
  const flashMessage = req.session.flashMessage ?? null
  const user = req.session.user ?? null
  req.session.flashMessage = null

  try {
    // Fetch all posts from the database, sorted by newest first
    const posts = await Post.find({}).sort({ date: -1 }).lean()
    res.render('community-board', {
      user,
      flashMessage,
      posts // Pass the posts to the EJS template
    })
  } catch (error) {
    console.error('Error fetching posts from the database:', error)
    res.status(500).render('error', {
      message: 'Error loading the community board',
      error
    })
  }
}

sessionHandler.donationListing = (req, res) => {
  // check if there is an error message in previous operations
  const flashMessage = req.session.flashMessage ?? null
  const user = req.session.user ?? null
  req.session.flashMessage = null
  res.render('donation-listing', {
    user,
    flashMessage
  })
}

sessionHandler.addDonation = (req, res) => {
  // check if there is an error message in previous operations
  const flashMessage = req.session.flashMessage ?? null
  const user = req.session.user ?? null
  req.session.flashMessage = null
  res.render('add-donation-item', {
    user,
    flashMessage
  })
}

sessionHandler.login = (req, res) => {
  // check if user is already logged in
  const user = req.session.user ?? null
  if (user) {
    req.session.flashMessage = 'You are already logged in'
    res.redirect('/home')
  }

  const flashMessage = req.session.flashMessage ?? null
  req.session.flashMessage = null

  res.render('login', {
    flashMessage,
    user
  })
}

sessionHandler.register = (req, res) => {
  const flashMessage = req.session.flashMessage ?? null
  const user = req.session.user ?? null
  req.session.flashMessage = null

  res.render('register', {
    flashMessage,
    user,
    info: null
  })
}

sessionHandler.logout = (req, res, next) => {
  req.session.flashMessage = null
  req.session.user = null
  req.session.items = null
  const flashMessage = 'You have been logged out'

  res.render('home', {
    flashMessage,
    user: null
  })
}

sessionHandler.else = (req, res) => {
  const flashMessage = req.session.flashMessage ?? null
  const user = req.session.user ?? null
  req.session.flashMessage = null
  res.status(404).render('error', {
    url: req.url,
    user,
    flashMessage
  })
}
