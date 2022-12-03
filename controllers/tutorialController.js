const { createCustomError } = require("../error/custom-error");
const asyncWrapper = require("../middleware/async");
/*MODEL IMPORT */ const Tutorial = require("../models/tutorialModel"); 

const newTutorial = (asyncWrapper(async (req,res,next)=>{
    req.body.tutor = req.user._id;
    const newTutorial = await Tutorial.create(req.body);
    if(!newTutorial) {
        return next(createCustomError("An error occured while creating a tutorial",400))
    }
    res.status(201).json({status:"success",data:{
        tutorial:newTutorial
    }})
}))

const getAllTutorials = asyncWrapper(async (req,res,next) => {
    const tutorials = await Tutorial.find().populate('tutor');
    if(!tutorials) {
        return next(createCustomError("An error occured while finding the tutorials",404));
    }
    res.status(200).json({status:"success",data:{
        tutorials
    }})
})

const getLastTutorials = asyncWrapper(async (req,res,next) => {
    const lastTutorials = await Tutorial.paginate({},{page:req.query.page,limit:7});
    if(!lastTutorials) {
        return next(createCustomError("An error occured while finding the last 5 tutorials",404));
    }  
    res.status(200).json({
        status:"success",
        data:{
            lastTutorials
        }
    })
})

const getTutorialBySlug = asyncWrapper(async (req,res,next) => {
    const tutorialBySlug = await Tutorial.findOne({slug:req.params.slug});
    if (!tutorialBySlug) {
        return next(createCustomError("An error occured while finding the tutorial with that slug"),400);
    }
    res.status(200).json({
        status:"success",
        data:{
            tutorialBySlug
        }
    })
})

const deleteTutorialById = asyncWrapper(async (req,res,next) => {
    const deleted = await Tutorial.findByIdAndDelete(req.params.id);
    if(!deleted) {
        return next(createCustomError("An error occured while deleting the tutorial with that id"),400);
    }
    res.status(204).json({
        status:"success"
    })
})

module.exports = {newTutorial,getAllTutorials,getLastTutorials,getTutorialBySlug,deleteTutorialById};