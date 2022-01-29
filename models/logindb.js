const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const loginSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    username: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: Number,
        min:3,
        max:5
    }
});

loginSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",loginSchema);