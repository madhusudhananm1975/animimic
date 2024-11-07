const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define a schema for the User collection
const userSchema = mongoose.Schema({
  name: String,
  mobile: String,
  username: {
    type: String,
    //required: true,
    unique: true
  },
  email: {
    type: String,
    //required: true,
    unique: true
  },
  password: String,
  secquestion1: String,
  secanswer1: String,
  secquestion2: String,
  secanswer2: String,
  secquestion3: String,
  secanswer3: String,
  photolink: String,
  account_info:{
    total_posts: {
        type: Number,
        default: 0
    },
    total_reads: {
        type: Number,
        default: 0
    },
},
blogs: {
    type: [ Schema.Types.ObjectId ],
    ref: 'blogs',
    default: [],
},

});
module.exports = mongoose.model('User', userSchema);