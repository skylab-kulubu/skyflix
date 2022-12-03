const mongoose = require("mongoose");
const mongoose_pagination = require("mongoose-paginate-v2");
const slugify = require("slugify");

const tutorialSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    slug:{
        type:String,
    },
    coverPhotoURL : {
        type:String,
        required:true,
    },
    videoURL: {
        type:String,
        required:true,
        unique:true
    },
    tutor: {type:mongoose.Schema.ObjectId, ref:"User"},
    duration : {
        type:Number,
        required:[true,"A tutorial must have a name"]
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
          values: ['easy', 'medium', 'difficult'],
          message: 'Difficulty is either: easy, medium, difficult'
        }
      },
    description:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        select:false
    },
    updatedAt:{
        type:Date
    }
})

//PLUGINS

/*PAGINATION*/ tutorialSchema.plugin(mongoose_pagination);

//MIDDLEWARES

/// ADD USERS ID AS REFERENCE

//SLUGIFY
tutorialSchema.pre('save',function(next){
    this.slug = slugify(this.name,{lower:true});
    this.createdAt = Date.now()
    next();
})



//MODEL DECLARATION

const tutorialModel = mongoose.model("Tutorial",tutorialSchema);

module.exports = tutorialModel;