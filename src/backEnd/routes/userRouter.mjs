import express from 'express'
import {
  UserController
} from '../controller/userController.mjs'
import {
  validator
} from '../middlewares/validator.mjs'
import {
  sessionHandler
} from '../middlewares/actionHandler.mjs'
import {
  CommunityBoardController
} from '../controller/CommunityBoardController.mjs'
import {
  DonationItemController
} from '../controller/donationItemController.mjs'

const router = express.Router()

// Home and User Routes
router.get('/', sessionHandler.home)
router.get('/home', sessionHandler.home)
router.get('/info-page', sessionHandler.info)
router.get('/edu-rec', sessionHandler.eduRec)
router.get('/login', sessionHandler.login)
router.post('/login', validator.login, UserController.login, sessionHandler.home)
router.get('/register', validator.isOkToRegister, sessionHandler.register)
router.post('/register', validator.register, UserController.register, sessionHandler.login)
router.get('/logout', sessionHandler.logout)

// Route to display the community board
router.get('/community-board', CommunityBoardController.getPosts)

// Route to handle new post submission
router.post('/community-board/post', validator.isLoggedIn, CommunityBoardController.addPost)

// Route to update a post
router.post('/community-board/update/:id', validator.isLoggedIn, CommunityBoardController.updatePost)

// Route to delete a post
router.get('/community-board/delete/:id', validator.isLoggedIn, CommunityBoardController.deletePost)

// Route to handle reply submission
router.post('/community-board/reply/:id', validator.isLoggedIn, CommunityBoardController.addReply)

// Route to delete a reply
router.post('/community-board/delete-reply/:postId/:replyId', validator.isLoggedIn, CommunityBoardController.deleteReply)

// Route to display the user profile
router.get('/profile', validator.isLoggedIn, UserController.profile)
router.get('/profile/update', validator.isLoggedIn, UserController.getProfileUpdate)
router.post('/profile/update', validator.isLoggedIn, validator.updateProfile, UserController.postProfileUpdate)

// Route for donation item
router.get('/add-donation-item', (req, res) => res.render('add-donation-item'))
router.post('/add-donation-item', validator.isLoggedIn, DonationItemController.addDonationItem)
router.get('/donation-listing', validator.isLoggedIn, DonationItemController.getDonationItems)
router.post('/remove-item', DonationItemController.removeItem)
router.get('/edit-donation-item/:id', DonationItemController.renderEditForm)
router.post('/edit-donation-item/:id', DonationItemController.updateDonationItem)

// Catch-all Route for 404 Not Found
router.get('*', sessionHandler.else)

export default router
