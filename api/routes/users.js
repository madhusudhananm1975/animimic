const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');

const User = require('../models/user');
const Blogs = require('../models/blog');
const UserController = require('../controllers/user');


//login
app.post('/api/register', UserController.user_signup);


module.exports = app;
