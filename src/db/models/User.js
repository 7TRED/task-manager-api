const mongoose = require('mongoose');
const validator = require('validator');
const passwordValidator = require('password-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task  = require('./Task');

const passwordSchema = new passwordValidator();

passwordSchema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)
    .has().not().spaces()
    .is().not().oneOf(['Password', 'password', 'Password123'])
    .has().symbols(1)



const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim:true
    },
    lastName: {
        type: String,
        required: true,
        trim:true
    },
    nickname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email')
            }
        },
        trim: true,
        lowercase: true,
        unique:true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            let rules = passwordSchema.validate(value, { list: true });
            if (rules.length > 0) {
                console.log(rules)
                throw new Error('Invalid password')
            }
        }
    },
    avatar: {
        type:Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true,
    
        }
    }]
}, {
    timestamps:true
});


UserSchema.pre('save', async function (next) {
    const user = this
    try {
        if (user.isModified('password')) {
            user.password = await bcrypt.hash(user.password, 8);
        }
    } catch (e) {
        
    } finally {
        next();
    }
})

UserSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
})

UserSchema.statics.findByCredentials = async function (email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Unable to login");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error("Unable to login");
        }

        return user;
}

UserSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField:'owner'
})


UserSchema.methods.getAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY,{expiresIn:`${process.env.JWT_EXPIRES_IN}d`});
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token
}

UserSchema.methods.getPublicProfile = function () {
    const user = this;
    const userObject = user.toObject()
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}




const User = mongoose.model('User', UserSchema);

module.exports = User;