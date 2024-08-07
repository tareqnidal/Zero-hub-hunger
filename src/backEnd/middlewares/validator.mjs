import {
  validate as uuidValidator
} from 'uuid'
export const validator = {}

const renderWithError = (res, view, flashMessage, info, user = null) => {
  res.status(400).render(view, {
    flashMessage,
    user,
    ...(info && {
      info
    })
  })
}

const validateFields = (fields, res, view, info) => {
  for (const [field, message] of fields) {
    if (!info[field]) {
      renderWithError(res, view, message, info)
      return false
    }
  }
  return true
}

validator.register = (req, res, next) => {
  const info = req.body
  const fields = [
    ['firstName', 'Please enter your first name'],
    ['lastName', 'Please enter your last name'],
    ['username', 'Please enter your username'],
    ['email', 'Please enter your email'],
    ['password', 'Please enter your password']
  ]

  if (!validateFields(fields, res, 'register', info)) return

  if (!info.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
    return renderWithError(res, 'register', 'Please enter a valid email address', info)
  }

  if (info.password.length < 8) {
    return renderWithError(res, 'register', 'Password must be at least 8 characters long', info)
  }

  const passwordRequirements = [
    [/[A-Z]/, 'Password must contain at least one uppercase letter'],
    [/[a-z]/, 'Password must contain at least one lowercase letter'],
    [/[0-9]/, 'Password must contain at least one number']
  ]

  for (const [regex, message] of passwordRequirements) {
    if (!info.password.match(regex)) {
      return renderWithError(res, 'register', message, info)
    }
  }

  next()
}

validator.login = (req, res, next) => {
  const info = req.body
  const fields = [
    ['username', 'Please enter your User Name'],
    ['password', 'Please enter your password']
  ]

  if (!validateFields(fields, res, 'login', info)) return

  next()
}

validator.addDonation = (req, res, next) => {
  const user = req.session.user ?? null
  const info = req.body

  // Check if user is logged in
  if (!user) {
    return renderWithError(res, 'login', 'Please login to be able to add items', info, user)
  }

  // Validate user ID
  if (!uuidValidator(user.id)) {
    return renderWithError(res, 'login', 'Something is wrong with your credentials', info, user)
  }

  next()
}

validator.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return renderWithError(res, 'login', 'Please login to continue')
  }
  next()
}

validator.isOkToRegister = (req, res, next) => {
  if (req.session.user) {
    return res.status(400).render('home', {
      flashMessage: 'You are already logged in',
      user: req.session.user
    })
  }
  next()
}

validator.validateId = (req, res, next) => {
  if (!uuidValidator(req.params.id)) {
    req.session.flashMessage = 'Invalid id'
    return res.status(400).redirect('/donation-listing')
  }
  next()
}

validator.validateUserItem = (req, res, next) => {
  const {
    user,
    items
  } = req.session
  if (user.id !== items[0].createdBy) {
    req.session.flashMessage = 'You are not allowed to edit this item'
    return res.status(401).redirect('/donation-listing')
  }
  next()
}

validator.updateProfile = (req, res, next) => {
  const info = req.body
  const fields = [
    ['firstName', 'Please enter your first name'],
    ['lastName', 'Please enter your last name'],
    ['username', 'Please enter your username'],
    ['email', 'Please enter your email']
  ]
  if (!validateFields(fields, res, 'profileUpdate', info)) return
  next()
}
