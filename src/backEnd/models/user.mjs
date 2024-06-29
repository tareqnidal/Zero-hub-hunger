import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import {
  v4 as uuidv4
} from 'uuid'

export const UserModel = {}

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    toUpperCase: true
  },
  lastName: {
    type: String,
    required: true,
    toUpperCase: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }

}, {
  timestamps: true
})

const User = mongoose.model('User', userSchema)

UserModel.register = async (user) => {
  try {
    let reg = await User.findOne({
      email: user.email
    })
    if (reg) {
      const errorData = {
        status: 409,
        message: 'Email already registered'
      }
      return new Error(JSON.stringify(errorData))
    }

    reg = await User.findOne({
      username: user.username
    })
    if (reg) {
      const errorData = {
        status: 409,
        message: 'Username already registered'
      }
      return new Error(JSON.stringify(errorData))
    }

    user.password = await bcrypt.hash(user.password, 12)
    let attempts = 10
    while (true) {
      user.id = uuidv4()
      reg = await User.findOne({
        id: user.id
      })
      if (!reg) break
      if (attempts === 0) {
        const errorData = {
          status: 500,
          message: 'Internal server error'
        }
        return new Error(JSON.stringify(errorData))
      }
      attempts--
    }

    const newUser = new User(user)
    await newUser.save()
    return newUser
  } catch (err) {
    return new Error({
      status: 500,
      message: 'Internal Server Error'
    })
  }
}

// Login user
UserModel.login = async (user) => {
  const foundUser = await User.findOne({
    username: user.username
  })
  if (!foundUser) {
    return new Error('User not found')
  }
  if (!await bcrypt.compare(user.password, foundUser.password)) {
    return new Error('Password incorrect')
  }
  return foundUser
}

UserModel.getAuthorName = async (id) => {
  try {
    const user = await User.findOne({
      id
    })
    if (!user) {
      return 'Could not find creator'
    }
    return user.firstName + ' ' + user.lastName
  } catch (err) {
    return 'Could not find creator'
  }
}

UserModel.getUser = async (id) => {
  try {
    const user = await User.findOne({
      id
    })
    if (!user) {
      const errorData = {
        status: 404,
        message: 'User not found'
      }
      return new Error(JSON.stringify(errorData))
    }
    return user
  } catch (err) {
    const errorData = {
      status: 500,
      message: 'Internal Server Error'
    }
    return new Error(JSON.stringify(errorData))
  }
}

UserModel.addItem = async (userId, itemId) => {
  try {
    const user = await UserModel.getUser(userId)
    user.items.push(itemId)
    await user.save()
    return true
  } catch (err) {
    const errorData = {
      status: 500,
      message: 'Internal Server Error'
    }
    return new Error(JSON.stringify(errorData))
  }
}

UserModel.updateUser = async (id, updateData) => {
  try {
    const user = await User.findOne({ id })
    if (!user) {
      throw new Error('User not found')
    }

    // Updating user fields if provided
    if (updateData.firstName) user.firstName = updateData.firstName
    if (updateData.lastName) user.lastName = updateData.lastName
    if (updateData.username) {
      const existingUsername = await User.findOne({ username: updateData.username, id: { $ne: id } })
      if (existingUsername) {
        throw new Error('Username already taken')
      }
      user.username = updateData.username
    }
    if (updateData.email) {
      const existingEmail = await User.findOne({ email: updateData.email, id: { $ne: id } })
      if (existingEmail) {
        throw new Error('Email already in use')
      }
      user.email = updateData.email
    }

    await user.save()
    return user
  } catch (err) {
    console.error('Error updating user:', err)
    throw err
  }
}

userSchema.index({ id: 1 })
