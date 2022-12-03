const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email : {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,"Please provide an email."]
    },
    role:{
        type:String,
        default:"yk",
        enum:{
            values: ['yk', 'admin'],
        },
    },
    password:{
        type:String,
        required:true,
        minlenght:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:true,
        validate:{
            validator:function(el) {
                return el === this.password;
            },
            message:"Passwords doesnt match."
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
});

// MIDDLEWARES

///HASH PASSWORD
userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    next();
});

//MAKE ROLE AS 'YK'
userSchema.pre('save',function(next){
    this.role = 'yk';
    next();
})

/// GET THE MODIFICATION DATE
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

///CORRECT PASSWORD
userSchema.methods.correctPassword = async function(candidatePassword,userPassword) {
    return await bcrypt.compare(candidatePassword,userPassword);
}

// CHECKS WHETHER THE PASSWORD HAS CHANGED AFTER THE TOKEN ISSUED
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        return JWTTimeStamp < changedTimeStamp;
    }
    
    return false;
}

//CREATE A RESET PASSWORD TOKEN
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10*60*1000;
    
    return resetToken;
}

const UserModel = mongoose.model('User',userSchema);

module.exports = UserModel;