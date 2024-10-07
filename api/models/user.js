const mongoose = require('mongoose');

// Define a schema for the User collection
const userSchema = new mongoose.Schema({
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
  secquestion: String,
  secanswer: String,
  photolink: String
});
module.exports = mongoose.model('User', userSchema);