// Requires
const Chat = require('./chat')
const Rating = require('./rating')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const randomatic = require('randomatic')


// Model
const userSchema = new mongoose.Schema({
    type: {
        required: true,
        type: Number
    },
    firstname: {
        maxlength: 20,
        minlength: 3,
        required: true,
        type: String,
        trim: true,
        lowercase: true,
        validate (value) {
            if (!validator.isAlpha(value)) {
                throw new Error('Username is invalid.')
            }
        }
    },
    lastname: {
        maxlength: 20,
        minlength: 3,
        required: true,
        type: String,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isAlpha(value)) {
                throw new Error('Username is invalid.')
            }
        }
    },
    email: {
        required: true,
        unique: true,
        type: String,
        trim: true,
        lowercase: true,
        validate (value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.')
            }
        }
    },
    password: {
        required: true,
        type: String,
        trim: true,
        minlength: 7
    },
    tokens: [{
        token: {
            required: true,
            type: String
        }
    }],
    avatar: {
        type: Buffer
    },
    banner: {
        type: Buffer
    },
    bio: {
        trim: true,
        default: 'Une bio par défaut. Rentrez ici votre histoire.',
        type: String,
        maxlength: 600,
        minlength: 10
    },
    instruments: {
        type: Array,
        default: []
    },
    events: [{
        event: {
            type: String,
            required: true
        }
    }],
    verified: {
        type: Boolean,
        default: false
    },
    hash: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    strict: false
})
userSchema.index({ firstname: 'text', lastname: 'text' })



// Virtual chat storage
userSchema.virtual('chats', {
    ref: 'Chat',
    localField: '_id',
    foreignField: 'users.user'
})

// Virtual ratings storage
userSchema.virtual('ratings', {
    ref: 'Rating',
    localField: '_id',
    foreignField: 'user'
})




// Pre operations
// ->
// Pre-save user
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = bcrypt.hashSync(user.password, 8)
    }

    return
})




// Statics
// ->




// Methods
// ->
// Generate auth token
userSchema.methods.generateAuthToken = async function (res) {
    let user = this

    // Generate random
    let random = await randomatic('aA0', 16)

    // Generating token
    const signOptions = {
        expiresIn: "7 days",
        algorithm: "RS256"
    }

    const PRIVATE_KEY = process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
    let token = await jwt.sign({ _id: user._id.toString(), random }, PRIVATE_KEY, signOptions)

    // Adding random token to db
    random = bcrypt.hashSync(random, 8)
    user.tokens = user.tokens.concat({
        token: random
    })

    // Save user
    await user.save()

    let splitToken = token.toString().split('.')
    const tokenPayload = splitToken[0] + '.' + splitToken[1]
    const tokenSignature = splitToken[2]

    // Generate cookies
    res.cookie('x-hp', tokenPayload, { sameSite: true, httpOnly: false, secure: false, maxAge: 1000 * 60 * 60 * 2 })
    res.cookie('x-s', tokenSignature, { sameSite: true, httpOnly: true, secure: false })

    // Return token
    return token
}

// checkCredentials of user
userSchema.methods.checkCredentials = async function (password, dbPassword) {
    const valid = bcrypt.compareSync(password, dbPassword)

    return valid
}

// Send only not vulnerables informations
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    delete userObject.banner
    delete userObject.hash

    userObject.firstname = userObject.firstname.charAt(0).toUpperCase() + userObject.firstname.slice(1)
    userObject.lastname = userObject.lastname.charAt(0).toUpperCase() + userObject.lastname.slice(1)

    return userObject
}



// Cascade delete tasks when user is deleted
userSchema.pre('remove', async function (next) {
    const user = this

    await Rating.deleteOne({ user: user._id })
    await Chat.deleteMany({ 'users.user': user._id })
    next()
})



// Export model
const User = mongoose.model('User', userSchema)
module.exports = User