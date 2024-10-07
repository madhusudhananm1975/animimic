const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');

const User = require('../models/user');
const UserController = require('../controllers/user');


//login
router.post('/login', UserController.user_login);

//delete user
router.delete('/:userId', UserController.user_delete);

//update user name & phone number
router.put('/:userId', UserController.user_update);

//register new user
router.post('/register', 
UserController.user_register);

//change password
router.post('/:userId/pwdchange', 
  
/*  [
  check('password').matches(/^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/).withMessage('must contain at least 8 chars, a combination of letters and numbers')
], */
UserController.change_password);

module.exports = router;
