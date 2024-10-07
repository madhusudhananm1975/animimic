// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./api/models/user');

// Creating an Express application instance
const app = express();
const PORT = 3000;
const url = 'mongodb+srv://testuser1:testUser123@animimic.nhuad.mongodb.net/?retryWrites=true&w=majority&appName=animimic'



app.use(cors());
// Connect to MongoDB database
mongoose.connect(url).then(() => { console.log('Connected to MongoDB'); })
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware for JWT validation
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
};

// Route to register a new user
app.post('/api/register', async (req, res) => {
  try {
    var hashedSecAnswer;
    // Check if the email already exists
    if(req.body.email != ""){
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    else {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json({ error: 'User Name already exists' });
      }
    }


    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    if(req.body.secanswer != "")
    {
       hashedSecAnswer = await bcrypt.hash(req.body.secanswer, 10);

    }


    // Create a new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
      mobile:req.body.mobile,
      secquestion: req.body.secquestion,
      secanswer: hashedSecAnswer,
      photolink: req.body.photolink,
      password: hashedPassword
    });
    
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to authenticate and log in a user
app.post('/api/login', async (req, res) => {
  try {
    var user = await User.findOne({ email: req.body.email });
    // Check if the email exists
  if (req.body.email)
  {
     user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'Email Not Found' });
    }

  } 
  else { //else use username instead of email. front end will ensure at least one of them is sent in api
       user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(401).json({ error: 'User Not Found' });
      }
    } 

    // Compare passwords
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT token

    const token = jwt.sign({ email: user.email }, 'secret');
   
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/update', verifyToken, async (req, res) => {// user can come to update screen only when logged in.
  try{
    if(req.body.name != "")
    {
      await User.updateOne( {email:req.body.email}, { $set: {name: req.body.name} } ) 
    };
    if(req.body.mobile != "")
    {
      await User.updateOne( {email:req.body.email}, { $set: {mobile: req.body.mobile} } ) 
    };
    if(req.body.secquestion != "")
    {
        await User.updateOne( {email:req.body.email}, { $set: {secquestion: req.body.secquestion} } ) 
    };
    if(req.body.secanswer != "")
    {
          const hashedSecAnswer = await bcrypt.hash(req.body.secanswer, 10);
          await User.updateOne( {email:req.body.email}, { $set: {secanswer: hashedSecAnswer} } ) 
    };
    if(req.body.photolink != "")
    {
          await User.updateOne( {email:req.body.email}, { $set: {photolink: req.body.photolink} } ) 
    };

    
    res.status(200).json({message: 'User updated'});
  }
  catch(error) {
    res.status(500).json({ error: 'Internal server error' });
  };
});


app.post('/api/reset', verifyToken, async (req, res) => {// user can come to update screen only when logged in.
  try{
    const user = await User.findOne({ email: req.body.email });
    if(req.body.secanswer != "")
    {
      const secanswermatch = await bcrypt.compare(req.body.secanswer, user.secanswer);
      if (!secanswermatch) {
        return res.status(401).json({ error: 'Invalid Answer to Security Question.' });
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
          await User.updateOne( {email:req.body.email}, { $set: {secanswer: hashedPassword} } ) 
    };

    
    res.status(200).json({message: 'Pawssword updated'});
  }
  catch(error) {
    res.status(500).json({ error: 'Internal server error' });
  };
});



// Protected route to get user details
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    // Fetch user details using decoded token
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ username: user.username, email: user.email, mobile: user.mobile, name: user.name });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to Animimic API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});