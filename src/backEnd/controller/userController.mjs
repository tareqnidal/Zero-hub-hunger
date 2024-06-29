import {
  UserModel as model
} from '../models/user.mjs'

export const UserController = {}

UserController.login = async (req, res, next) => {
  const user = await model.login(req.body)

  if (user instanceof Error) {
    req.session.flashMessage = user.message
    next()
    return
  }

  const sessionUser = {
    id: user.id,
    name: user.firstName + ' ' + user.lastName,
    username: user.username,
    email: user.email
  }

  req.session.user = sessionUser
  req.session.flashMessage = 'Successfully logged in'
  next()
}

// Register a new user
UserController.register = async (req, res, next) => {
  const user = await model.register(req.body)

  if (user instanceof Error) {
    const errorData = JSON.parse(user.message)
    req.session.flashMessage = errorData.message
    res.status(errorData.status).redirect('/register')
    return
  }

  req.session.flashMessage = 'Successfully registered, You can now login'
  next()
}

UserController.addItem = async (userId, itemId) => {
  try {
    await model.addItem(userId, itemId)
  } catch (error) {
    return new Error(error.message)
  }
}

UserController.getUser = async (id) => {
  try {
    return await model.getUser(id)
  } catch (error) {
    return new Error(error.message)
  }
}

UserController.getAuthorName = async (id) => {
  try {
    const user = await model.getUser(id)
    return user.firstName + ' ' + user.lastName
  } catch (error) {
    return 'Could not find creator'
  }
}

UserController.profile = async (req, res) => {
  const user = req.session.user
  if (!user) {
    req.session.flashMessage = 'Please log in to view this page'
    return res.redirect('/login')
  }

  try {
    const userDetails = await model.getUser(user.id)
    res.render('profile', {
      user: userDetails
    })
  } catch (error) {
    req.session.flashMessage = error.message
    res.status(500).render('error', {
      message: 'Failed to load user details'
    })
  }
}

UserController.getProfileUpdate = async (req, res) => {
  const user = req.session.user
  if (!user) {
    req.session.flashMessage = 'Please log in to update your profile'
    return res.redirect('/login')
  }
  res.render('profileUpdate', { user })
}

UserController.postProfileUpdate = async (req, res) => {
  try {
    const updatedUser = await model.updateUser(req.session.user.id, req.body)
    req.session.user = {
      id: updatedUser.id,
      name: updatedUser.firstName + ' ' + updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email
    }
    req.session.flashMessage = 'Profile updated successfully'
    res.redirect('/profile')
  } catch (error) {
    req.session.flashMessage = error.message
    res.status(400).render('profileUpdate', { user: req.body, flashMessage: error.message })
  }
}
