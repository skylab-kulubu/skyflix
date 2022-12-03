const asyncWrapper = require("../middleware/async");
const {createCustomError} = require("../error/custom-error");
const User= require("../models/userModel");

const getUser = (asyncWrapper(async (req,res,next)=>{
    try {
        const user = await User.findById(req.params.id)
    if(!user) 
        return next(createCustomError("There is no user with this id"),400);
    
    res.status(200).json({
        status: "success",
        data: user
    })
    }catch(e){
        return next(createCustomError(e.message,400))
    }
    
}))

module.exports = {getUser}