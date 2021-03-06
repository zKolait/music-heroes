require('../db/mongoose')
const User = require('../models/user')
const Rating = require('../models/rating')
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const { registerEmail } = require('../emails/auth')

// Middlewares
const auth = require('../middleware/auth')

// Router declaration
const router = new express.Router()



// Auth routes
// ->
// Register user
router.post('/auth/register', async (req, res) => {
    const user = new User(req.body)

    try {
        let allowedInstruments = ['Guitare', 'Violon', 'Piano', 'Ukulele', 'Batterie', 'Biniou', 'Harpe', 'Contrebasse', 'Violoncelle', 'Alto', 'Clavecin', 'Synthétiseur', 'Flûte à bec', 'Hautbois', 'Saxophone', 'Trompette', 'Trombone', 'Orgue', 'Tuba', 'Cymbale', 'Maracas', 'Tambour', 'Triangle']
        let validInstruments = user.instruments.every(instrument => allowedInstruments.includes(instrument))

        if (!validInstruments) {
            throw new Error('Instruments invalides.')
        }

        await user.save()
        const token = await user.generateAuthToken(res)
        let rating = await new Rating({ user: user._id })
        await rating.save()

        registerEmail(user)

        res.status(201).send({ success: true, user, token })
    } catch (e) {
        const error = e.message
        res.status(200).send({ success: false, error })
    }
})

// Login user
router.post('/auth/login', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password || req.body.length > 2) {
            return res.status(200).send({ message: 'Missing arguments.' })
        }

        let user = null
        if (req.body.email) {
            user = await User.findOne({ email: req.body.email })
        }

        if (!user) {
            // throw new Error('User not found.')
            return res.status(200).send('User not found.')
        }

        const valid = await user.checkCredentials(req.body.password, user.password)

        if (valid !== true) {
            throw new Error('Bad password or email.')
        }

        const token = await user.generateAuthToken(res)

        res.status(201).send({ success: true, user, token })
    } catch (e) {
        const error = e.message
        res.status(200).send(error)
    }
})

// Validate user
router.get('/auth/fetch', auth, async (req, res) => {
    try {
        res.send({ success: true, user: req.user, token: req.token })
    } catch (e) {
        const error = e.message
        res.status(400).send({ success: false, error })
    }
})

// Logout user
router.get('/auth/logout', auth, async (req, res) => {
    try {
        // Clear cookies
        res.clearCookie('x-hp', { path: '/' })
        res.clearCookie('x-s', { path: '/' })

        // Clear token in bdd
        let tokens = req.user.tokens.filter((token => !bcrypt.compareSync(req.random, token.token)))
        req.user.tokens = tokens
        await req.user.save()

        res.send({ success: true })
    } catch (e) {
        // Clear cookies
        res.clearCookie('x-hp', { path: '/' })
        res.clearCookie('x-s', { path: '/' })

        const error = e.message
        res.status(400).send({ success: true, error })
    }
})

// Validate email
router.get('/auth/email/:token', async (req, res) => {
    try {
        const splittedToken = req.params.token.split('.')
        const userId = splittedToken[0]
        const random = splittedToken[1]

        if (!userId || !random) {
            throw new Error('Validation failed.')
        }

        let user = await User.findById(userId)

        if (!user || user.verified || !user.hash) {
            throw new Error('Validation failed.')
        }

        let valid = bcrypt.compareSync(random, user.hash)

        if (valid !== true) {
            throw new Error('Validation failed.')
        }

        user.verified = true
        user.hash = null

        user.save()
        res.send({ success: true })
    } catch (e) {
        const error = e.message
        res.status(400).send({ success: false, error })
    }
})


// Export
module.exports = router