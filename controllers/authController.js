const jwt = require("jsonwebtoken");
const asyncWrapper = require("../middleware/async");
const User = require('../models/userModel');
const { createCustomError, customAPIError } = require("../error/custom-error");
const { promisify } = require("util");
const eventEmitter = require("../scripts/events/eventEmitter");
const { getHash } = require('../scripts/utils/hash');

const signToken = function (id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createAndSendToken = function (user, statusCode, req, res) {
    //create token
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)),
        httpOnly: true,
    })

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = asyncWrapper(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    if (!newUser) return next(createCustomError("An error occured while creating the new user", 400));

    res.status(201).json({
        status: "success", data: {
            newUser
        }
    })
})

exports.login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    //Check if user provided password and email
    if (!email || !password) return next(createCustomError("An email or password should be provided to login", 400))

    //Check if the user exists via using email as unique identifier
    const existedUser = await User.findOne({ email }).select('+password');
    /*CHECKING IF THE PASSWORD IS CORRECT*/
    if (!existedUser || !(await existedUser.correctPassword(password, existedUser.password))) return next(createCustomError("Incorrect email or password", 401))

    //SEND TOKEN
    createAndSendToken(existedUser, 200, req, res);
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: "success" });
}

exports.protectRoute = asyncWrapper(async (req, res, next) => {
    console.log("a")
    //Get the token check if its there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next(createCustomError("Please login to get access.", 401));

    //VERIFY IF THE TOKEN IS TRUE BY CREATING THE NEW EQUAL ONE IN THE SERVER and it returns the token as decoded
    const decodedT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //CHECK IF THE USER STILL EXIST
    const currentUser = await User.findById(decodedT.id);
    if (!currentUser) next(createCustomError("The user doesn't exist anymore", 401));

    //CHECK IF THE USER CHANGED HIS PASSWORD AFTER THE TOKEN ISSUED
    if (currentUser.changedPasswordAfter(decodedT.iat)) {
        return next(createCustomError("The password has been changed after the token was issued", 401));
    }

    //GRANT ACCESS - ALL IS OK!
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes[req.user.role]) {
            return next(createCustomError("You have no permission to do that", 403))
        }

        next();
    }
}

exports.forgotPassword = asyncWrapper(async (req, res, next) => {
    try {
        const { email } = req.body
        const existedUser = await User.findOne({ email });

        if (!existedUser)
            return next(createCustomError("there is no user with this email", 400))

        const { passwordResetToken, passwordResetExpires} = existedUser.createPasswordResetToken()
        await existedUser.updateOne({ passwordResetToken, passwordResetExpires })

        eventEmitter.emit("send_email", {
            to: email,
            subject: "Şifre Yenileme",
            html: `https://localhost:8800/${passwordResetToken}`
        });
        res.status(200).json({ status: "success", data: "email recieved" })
    } catch (e) {
        return next(createCustomError(e.message, 400))
    }
})

exports.changePassword = (asyncWrapper(async (req, res, next) => {
    try {
        let { token } = req.params;
        let { password, passwordConfirm } = req.body;

        if (password !== passwordConfirm)
            return next(createCustomError("Passwords must be same", 400));

        const existedUser = await User.findOne({ passwordResetToken: token })

        if (!existedUser)
            return next(createCustomError("Token does not match", 400))

        password = await getHash(password)

        await existedUser.updateOne({ password })

        res.status(200).json({ status: "success", data: "password changed successfully" })
    } catch (e) {
        return next(createCustomError(e.message, 400))
    }
}))