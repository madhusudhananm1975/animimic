const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define a schema for the User collection
const loginSchema = mongoose.Schema({
  name: String,
  dtime: String,
  password: String,

}
);
module.exports = mongoose.model('Login', loginSchema);