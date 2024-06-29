import {
  DonationItem
} from '../models/donationItem.mjs'
import mongoose from 'mongoose'

export const DonationItemController = {}

DonationItemController.addDonationItem = async (req, res) => {
  try {
    const {
      title,
      description,
      quantity,
      category,
      expirationDate,
      pickupInstruction,
      status
    } = req.body
    const newDonationItem = new DonationItem({
      id: new mongoose.Types.ObjectId().toString(),
      title,
      description,
      quantity,
      category,
      expirationDate,
      pickupInstruction,
      status,
      donatedBy: req.session.user.name
    })
    await newDonationItem.save()
    res.redirect('/donation-listing')
  } catch (error) {
    console.error('Error adding donation item:', error)
    res.status(500).send('Error adding donation item')
  }
}

DonationItemController.getDonationItems = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize the date to the beginning of the day
    const items = await DonationItem.find({
      expirationDate: {
        $gt: today
      },
      $or: [{
        removed: {
          $exists: false
        }
      }, {
        removed: false
      }] // Fetch items not marked as removed or without the removed field
    }).lean()

    res.render('donation-listing', {
      items
    })
  } catch (error) {
    console.error('Error fetching donation items:', error)
    res.status(500).send('Error fetching donation items')
  }
}

DonationItemController.removeItem = async (req, res) => {
  try {
    const {
      itemId
    } = req.body
    const user = req.session.user

    const item = await DonationItem.findOne({
      id: itemId
    })

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      })
    }

    if (item.donatedBy !== user.name) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this item'
      })
    }

    item.removed = true
    await item.save()

    res.json({
      success: true
    })
  } catch (error) {
    console.error('Error removing item:', error)
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    })
  }
}

DonationItemController.renderEditForm = async (req, res) => {
  try {
    const {
      id
    } = req.params
    const user = req.session.user

    const item = await DonationItem.findOne({
      id
    })

    if (!item) {
      req.session.flashMessage = 'Item not found'
      return res.status(404).redirect('/donation-listing')
    }

    if (item.donatedBy !== user.name) {
      req.session.flashMessage = 'Not authorized to edit this item'
      return res.status(403).redirect('/donation-listing')
    }

    res.render('edit-donation-item', {
      item
    })
  } catch (error) {
    console.error('Error rendering edit form:', error)
    res.status(500).send('Error rendering edit form')
  }
}

DonationItemController.updateDonationItem = async (req, res) => {
  try {
    const {
      id
    } = req.params
    const user = req.session.user

    const item = await DonationItem.findOne({
      id
    })

    if (!item) {
      req.session.flashMessage = 'Item not found'
      return res.status(404).redirect('/donation-listing')
    }

    if (item.donatedBy !== user.name) {
      req.session.flashMessage = 'Not authorized to edit this item'
      return res.status(403).redirect('/donation-listing')
    }

    const {
      title,
      description,
      quantity,
      category,
      expirationDate,
      pickupInstruction,
      status
    } = req.body

    item.title = title
    item.description = description
    item.quantity = quantity
    item.category = category
    item.expirationDate = expirationDate ? new Date(expirationDate) : null
    item.pickupInstruction = pickupInstruction
    item.status = status

    await item.save()

    req.session.flashMessage = 'Item updated successfully'
    res.redirect('/donation-listing')
  } catch (error) {
    console.error('Error updating donation item:', error)
    res.status(500).send('Error updating donation item')
  }
}
