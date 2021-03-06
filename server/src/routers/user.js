require('../db/mongoose')
const User = require('../models/user')
const Rating = require('../models/rating')
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const sharp = require('sharp')

// Middlewares
const auth = require('../middleware/auth')
const serverauth = require('../middleware/serverauth')

// Router declaration
const router = new express.Router()



// User routes
// ->
// Create user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        let instruments = ['guitar', 'piano', 'flute']
        let validInstruments = user.instruments.every(instrument => instruments.includes(instrument.toLowerCase()))

        if (!validInstruments) {
            throw new Error('Instruments invalides.')
        }

        await user.save()
        let rating = await new Rating({ user: user._id })
        await rating.save()

        res.status(201).send({ success: true, user })
    } catch (e) {
        const error = e.message
        res.status(400).send({ success: false, error })
    }
})

// Get user me
router.get('/users/me', auth, async (req, res) => {
    try {
        res.send({ success: true, user: req.user })
    } catch (e) {
        const error = e.message
        res.status(400).send({ success: false, error })
    }
})

// Get user other
router.get('/users/:id', auth, async (req, res) => {
    try {
        let user = await User.findById(req.params.id)

        if (!user) {
            throw new Error('Utilisateur incorrect')
        }

        res.send({ success: true, user })
    } catch (e) {
        const error = e.message
        res.status(400).send({ success: false, error })
    }
})

// Update user
router.patch('/users/me', auth, async (req, res) => {
    try {
        if (!req.user) {
            throw new Error('Utilisateur invalide, veuillez vous reconnecter.')
        }

        // Validate params
        let allowedUpdates = ['firstname', 'lastname', 'email', 'password', 'bio', 'instruments']
        let updates = Object.keys(req.body)

        let valid = updates.every(update => allowedUpdates.includes(update))

        if (!valid) {
            throw new Error('Arguments invalides.')
        }

        if (req.body.instruments) {
            let allowedInstruments = ['Guitare', 'Violon', 'Piano', 'Ukulele', 'Batterie', 'Biniou', 'Harpe', 'Contrebasse', 'Violoncelle', 'Alto', 'Clavecin', 'Synthétiseur', 'Flûte à bec', 'Hautbois', 'Saxophone', 'Trompette', 'Trombone', 'Orgue', 'Tuba', 'Cymbale', 'Maracas', 'Tambour', 'Triangle']
            validInstruments = req.body.instruments.every(instrument => allowedInstruments.includes(instrument))

            if (!validInstruments) {
                throw new Error('Instruments invalides.')
            }
        }

        // Update user
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        
        res.send({ success: true, user: req.user })
    } catch (e) {
        const error = e.message
        res.status(200).send({ success: false, error })
    }
})

// Delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()

        res.send({ success: true })
    } catch (e) {
        const error = e.message
        res.status(400).send({ success: false, error })
    }
})

const upload = multer({
    limits: {
        fileSize: 2048000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            callback(`Impossible d'ajouter ce fichier.`, true)
        }

        callback(undefined, true)
    }
})

// Set user's avatar
router.patch('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        let user = req.user

        const buffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer()
        user.avatar = buffer
        user.save()

        res.send({ success: true })
    } catch (e) {
        const error = e.message
        res.status(200).send({ success: false, error })
    }
})

// Set user's banner
router.patch('/users/me/banner', auth, upload.single('banner'), async (req, res) => {
    try {
        let user = req.user

        const buffer = await sharp(req.file.buffer).resize(1440, 250).png().toBuffer()
        user.banner = buffer
        user.save()

        res.send({ success: true})
    } catch (e) {
        const error = e.message
        res.status(200).send({ success: false, error })
    }
})

// Get user avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('No user or avatar.')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar.toString('base64'))
    } catch (e) {
        const error = e.message
        res.status(200).send({ success: false, error })
    }
})

// Get user banner
router.get('/users/:id/banner', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.banner) {
            throw new Error('No user or banner')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.banner.toString('base64'))
    } catch (e) {
        const error = e.message
        res.status(200).send({ success: false, error })
    }
})


// Export
module.exports = router