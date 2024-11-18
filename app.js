// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const requestIp = require('request-ip');
const User = require('./api/models/user');
const Login = require('./api/models/login');
const Blogs = require('./api/models/blog');
const URI = require('./api/constants/const')
const cors = require('cors')

const app = express();
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

/* User registration */
app.post('/api/register', async (req, res) => {
  try {
    var tmpmobile = "";
    var tmpname = "";

    var tmpsecanswer1 = "";
    var tmpsecanswer2 = "";
    var tmpsecanswer3 = "";
    var tmpsecquestion1 = "";
    var tmpsecquestion2 = "";
    var tmpsecquestion3 = "";
    var tmpphotolink = "";
    

    // Check if the email already exists
    if(req.body.email != ""){
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    if (req.body.username){
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json({ error: 'User Name already exists' });
      }
    }


    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    if(req.body.photolink)
    {
        tmpphotolink = req.body.photolink;       
    }
    if(req.body.secquestion1)
    {
      tmpsecquestion1 = req.body.secquestion1;
    }
    if(req.body.secquestion2)
    {
      tmpsecquestion2 = req.body.secquestion2;
    }
    if(req.body.secquestion3)
    {
      tmpsecquestion3 = req.body.secquestion3;
    }
    if(req.body.secanswer1)
    {
      tmpsecanswer1 = await bcrypt.hash(req.body.secanswer1, 10);
    }
    if(req.body.secanswer2)
    {
      tmpsecanswer2 = await bcrypt.hash(req.body.secanswer2, 10);
    }
    if(req.body.secanswer3)
    {
      tmpsecanswer3 = await bcrypt.hash(req.body.secanswer3, 10);
    }
    if(req.body.mobile)
    {
        tmpmobile = req.body.mobile;
    }
    if(req.body.name)
    {
        tmpname = req.body.name;
    }



    // Create a new user
    const newUser = new User({ 
      name: tmpname,
      username: req.body.username,
      mobile: tmpmobile,
      email: req.body.email,
      password: hashedPassword,
      photolink: tmpphotolink,
      secquestion1: tmpsecquestion1,
      secquestion2: tmpsecquestion2,
      secquestion3: tmpsecquestion3,
      secanswer1: tmpsecanswer1,
      secanswer2: tmpsecanswer2,
      secanswer3: tmpsecanswer3,
      account_info:{total_posts: 0, total_reads: 0},
      

    });

    await newUser.save();
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' + error});
  }
});

/* User Login */
app.post('/api/login', async (req, res) => {
  var userid = "";
  try {
    var date_time = new Date();
    console.log(date_time);
    const newLogin = new Login({ 
      name: req.body.email,
      dtime: date_time,
      password: req.body.password
    });

    await newLogin.save();
    var user = await User.findOne({ email: req.body.email });
    // Check if the email exists
  if (req.body.email)
  {
     user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'Email Not Found' });
    }
    else
    {
      userid = user.id;
      console.log(userid);
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
    
   
    res.status(200).json({ token, userid });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' + error });
  }
});

/* User Update. token verification has been removed because front end team wanted to send secquestion and secanswer in separate API instead of registration itself */
//app.put('/api/update', verifyToken, async (req, res) => {// user can come to update screen only when logged in.
app.put('/api/update', async (req, res) => {// user can come to update screen only when logged in.
  try{

    if(!req.body.email)
    {
      return res.status(401).json({ error: 'Invalid Email.' });
    }
    if (req.body.email)
    {
       test =  await User.find({email: req.body.email});
       if(test == [])
       {
        return res.status(401).json({ error: 'Please enter valid Email.' });
       }    
    }
    if(req.body.name)
    {
      await User.updateOne( {email:req.body.email}, { $set: {name: req.body.name} } ) 
    };
    if(req.body.mobile)
    {
      await User.updateOne( {email:req.body.email}, { $set: {mobile: req.body.mobile} } ) 
    };
    if(req.body.secquestion1)
    {
        await User.updateOne( {email:req.body.email}, { $set: {secquestion1: req.body.secquestion1} } ) 
    };
    if(req.body.secanswer1)
    {
          const hashedSecAnswer = await bcrypt.hash(req.body.secanswer1, 10);
          await User.updateOne( {email:req.body.email}, { $set: {secanswer1: hashedSecAnswer} } ) 
    };
    if(req.body.secquestion2)
    {
          await User.updateOne( {email:req.body.email}, { $set: {secquestion2: req.body.secquestion2} } ) 
    };
    if(req.body.secanswer2)
    {
          const hashedSecAnswer = await bcrypt.hash(req.body.secanswer2, 10);
          await User.updateOne( {email:req.body.email}, { $set: {secanswer2: hashedSecAnswer} } ) 
    };
    if(req.body.secquestion3)
    {
          await User.updateOne( {email:req.body.email}, { $set: {secquestion3: req.body.secquestion3} } ) 
    };
    if(req.body.secanswer3)
    {
          const hashedSecAnswer = await bcrypt.hash(req.body.secanswer3, 10);
          await User.updateOne( {email:req.body.email}, { $set: {secanswer3: hashedSecAnswer} } ) 
    };
    if(req.body.photolink)
    {
          await User.updateOne( {email:req.body.email}, { $set: {photolink: req.body.photolink} } ) 
    };

    
    return res.status(200).json({message: 'User updated'});
  }
  catch(error) {
    return res.status(500).json({ error: 'Internal server error' });
  };
});



/* DELETE user */
app.delete('/api/delete', async (req, res) => {

  try{

  if (req.body.id)
    {
       if (mongoose.isValidObjectId(req.body.id))
       {
        testuser = await User.findById(req.body.id);
        if (testuser == null)
        {
         return res.status(401).json({
           statusCode: 401,
           message: `Invalid User id`,
           data: {},
         });
        }
        else{
              // Mongo stores the id as `_id` by default
              const result = await User.deleteOne({ _id: req.body.id });
              return res.status(200).json({
                statusCode: 200,
                message: `User Deleted`,
               // data: {},
              });
        }
       }
       else{
        return res.status(401).json({
          statusCode: 401,
          message: `Invalid User id`,
         // data: {},
        });
       }
  
    }
}
catch (error)
{
  return res.status(401).json({
    statusCode: 401,
    message: error,
    data: {},
  });
}

});


/* Reset password */
app.post('/api/reset', async (req, res) => {// user can come to update screen only when logged in.
  try{

    if(!req.body.email){
      return res.status(200).json({message: 'Please provide email for password reset'});
    }
    if(!req.body.secanswer){
      return res.status(200).json({message: 'Please provide security answer for password reset'});
    }
    if(!req.body.secquestion){
      return res.status(200).json({message: 'Please provide security question for password reset'});
    }
    var questionmatch = false;
    const user = await User.findOne({ email: req.body.email });
    //check if secanswer matches with any of the 3 secanswers already  present in table for that user.
    if(req.body.secanswer != "")
    {
      const secanswermatch = await bcrypt.compare(req.body.secanswer, user.secanswer1);
      if(req.body.secquestion == user.secquestion1)
      {
        questionmatch = true;
        console.log(user.secquestion1);
      }
      if (!secanswermatch) 
      {
        questionmatch = false;
        const secanswermatch = await bcrypt.compare(req.body.secanswer, user.secanswer2);
        if(req.body.secquestion == user.secquestion2)
          {
            questionmatch = true;
          }
        if (!secanswermatch)
        {
          questionmatch = false;
          const secanswermatch = await bcrypt.compare(req.body.secanswer, user.secanswer3);
          if(req.body.secquestion == user.secquestion3)
            {
              questionmatch = true;
            }

        }
      }
      if (!secanswermatch) 
      {
          return res.status(401).json({ error: 'Invalid Security Answer.' });
      }
      if (!questionmatch)
      {
          return res.status(401).json({ error: 'Invalid Security Question.' });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
          await User.updateOne( {email:req.body.email}, { $set: {password: hashedPassword} } ) 
          return res.status(200).json({message: 'Pawssword updated'});
    }; 
    return res.status(200).json({message: 'Pawssword missing'});
  }
  catch(error) {
    return res.status(500).json({ error: 'Internal server error' });
  };
});



/* Get User details */
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    // Fetch user details using decoded token
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ username: user.username, email: user.email, mobile: user.mobile, 
                          name: user.name, secquestion1: user.secquestion1,
                          secquestion2: user.secquestion2, secquestion3: user.secquestion3,
                          photolink: user.photolink
                         });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* POST Create Blog */
app.post('/api/blog', async (req, res, next) => {
  //const { blog_id, title, author, content } = req.body;

  var tmpblog_id = "";
  var tmptitle = "";
  var tmpbanner = "";
  var tmpdes = "";
  var tmpcontent = "";
  var tmptags = "";
  var tmpauthor = "";
  var tmptotal_likes = 0;
  var tmptotal_comments = 0;
  var tmptotal_reads = 0;
  var tmptotal_parent_comments =  0;
  var tmpcomments = "";
  var tmpdraft = "";

  if (req.body.blog_id)
  {
     tmpblog_id = req.body.blog_id;
  }
  if (req.body.title)
  {
    tmptitle = req.body.title;
  }
  if (req.body.banner)
  {
    tmpbanner = req.body.banner;
  }
  if (req.body.des)
  {
     tmpdes = req.body.des;
  }
  if (req.body.content)
  {
     tmpcontent = req.body.content;
  }
  if (req.body.tags)
  {
     tmptags = req.body.tags;
  }
  if (req.body.author)
  {
     tmpauthor = req.body.author;
     if (mongoose.isValidObjectId(req.body.author))
     {
      author = await User.findById(req.body.author);
      if (author == null)
      {
       return res.status(401).json({
         statusCode: 401,
         message: `Invalid Author id`,
         data: {},
       });
      }
     }
     else{
      return res.status(401).json({
        statusCode: 401,
        message: `Invalid Author id`,
        data: {},
      });
     }

  }
  if (req.body.activity.total_likes)
  {
     if (!isNaN)
     {
      tmptotal_likes = req.body.activity.total_likes;
     }
    
  }
  if (req.body.activity.total_comments)
  {
    if (!isNaN)
      {
     tmptotal_comments = req.body.activity.total_comments;
      }
  }
  if (req.body.activity.total_reads)
  {
    if (!isNaN)
      {
     tmptotal_reads = req.body.activity.total_reads;
      }
  }
  if (req.body.activity.total_parent_comments)
  {
    if (!isNaN)
      {
      tmptotal_parent_comments = req.body.activity.total_parent_comments;
      }
  }
  if (req.body.comments)
  {
     tmpcomments = req.body.comments;
  }
  if (req.body.draft)
  {
      tmpdraft = req.body.draft;
  }


 
try
{
  // Create a new post
  const post = new Blogs({
    blog_id:  tmpblog_id,
    title : req.body.title,
    banner : tmpbanner,
    des : tmpdes,
    content : tmpcontent,
    tags : tmptags,
    author : tmpauthor,
    activity: {
      total_likes : tmptotal_likes,
      total_comments : tmptotal_comments,
      total_reads : tmptotal_reads,
      total_parent_comments :  tmptotal_parent_comments,
    },
   // comments: tmpcomments,
    draft: tmpdraft,
  });
  // Save the post into the DB
  await post.save();
  return res.status(201).json({
    statusCode: 201,
    message: 'Created Blog post',
    data: { post },
  });
}
catch(error){
  return res.status(401).json({
    statusCode: 401,
    message: "data type mismatch " + error,
    data: {  },
  });
}

}); 


/* Update an existing blog */
app.put('/api/updateblog', async (req, res) => {
  //const { blog_id, title, author, content } = req.body;

  var tmpblog_id = "";
  var tmptitle = "";
  var tmpbanner = "";
  var tmpdes = "";
  var tmpcontent = "";
  var tmptags = "";
  var tmpauthor = "";
  var tmptotal_likes = 0;
  var tmptotal_comments = 0;
  var tmptotal_reads = "";
  var tmptotal_parent_comments =  "";
  var tmpcomments = "";
  var tmpdraft = "";
  var statusmessage = "";

  if (req.body.blog_id)
    {
      tmpblog_id = req.body.blog_id;
       if (mongoose.isValidObjectId(req.body.blog_id))
       {
        blodid = await Blogs.findById(req.body.blog_id);
        if (blodid == null)
        {
         return res.status(401).json({
           statusCode: 401,
           message: `Invalid BLog id`,
           data: {},
         });
        }
       }
       else{
        return res.status(401).json({
          statusCode: 401,
          message: `Invalid BLog id`,
          data: {},
        });
       }
  
    }
  if (req.body.title)
  {
    tmptitle = req.body.title;
  }
  if (req.body.banner)
  {
    tmpbanner = req.body.banner;
  }
  if (req.body.des)
  {
     tmpdes = req.body.des;
  }
  if (req.body.content)
  {
     tmpcontent = req.body.content;
  }
  if (req.body.tags)
  {
     tmptags = req.body.tags;
  }
  if (req.body.author)
    {
       tmpauthor = req.body.author;
       if (mongoose.isValidObjectId(req.body.author))
       {
        author = await User.findById(req.body.author);
        if (author == null)
        {
         return res.status(401).json({
           statusCode: 401,
           message: `Invalid Author id`,
           data: {},
         });
        }
       }
       else{
        return res.status(401).json({
          statusCode: 401,
          message: `Invalid Author id`,
          data: {},
        });
       }
  
    }
    if (req.body.activity.total_likes)
      {
         if (!isNaN)
         {
          tmptotal_likes = req.body.activity.total_likes;
         }
        
      }
      if (req.body.activity.total_comments)
      {
        if (!isNaN)
          {
         tmptotal_comments = req.body.activity.total_comments;
          }
      }
      if (req.body.activity.total_reads)
      {
        if (!isNaN)
          {
         tmptotal_reads = req.body.activity.total_reads;
          }
      }
      if (req.body.activity.total_parent_comments)
      {
        if (!isNaN)
          {
          tmptotal_parent_comments = req.body.activity.total_parent_comments;
          }
      }
  if (req.body.comments)
  {
     tmpcomments = req.body.comments;
  }
  if (req.body.draft)
  {
      tmpdraft = req.body.draft;
  }


 author = await User.findById(req.body.author);
 if (author == null)
 {
  return res.status(401).json({
    statusCode: 401,
    message: `Invalid Author id`,
    data: {},
  });
 }
 
try{

  // Update the existing blog
  const post = await Blogs.findByIdAndUpdate(
    req.body.blog_id,
{
    //blog_id:  tmpblog_id,
    title : req.body.title,
    banner : tmpbanner,
    des : tmpdes,
    content : tmpcontent,
    tags : tmptags,
    author : tmpauthor,
    activity: {
      total_likes : tmptotal_likes,
      total_comments : tmptotal_comments,
      total_reads : tmptotal_reads,
      total_parent_comments :  tmptotal_parent_comments,
    },
    comments: tmpcomments,
    usercomments: req.body.usercomments,
    draft: tmpdraft,
  },
 

);
if(post != null){
  statusmessage = "update successful";
}
else
{
  statusmessage = "update failed."
}

return res.status(200).json({
  statusCode: 200,
  message: statusmessage,
  data: { post },
});

}
catch(error)
{
  statusmessage = error;
  return res.status(401).json({
    statusCode: 401,
    message: "Invalid data type. " + statusmessage,
    data: {  },
  });
}

}
);


/* DELETE an existing blog */
app.delete('/api/deleteblog', async (req, res) => {

  try{

  if (req.body.id)
    {
       if (mongoose.isValidObjectId(req.body.id))
       {
        blogdid = await Blogs.findById(req.body.id);
        if (blogdid == null)
        {
         return res.status(401).json({
           statusCode: 401,
           message: `Invalid BLog id`,
           data: {},
         });
        }
        else{
              // Mongo stores the id as `_id` by default
              const result = await Blogs.deleteOne({ _id: req.body.id });
              return res.status(200).json({
                statusCode: 200,
                message: `Deleted ${result.deletedCount} post(s)`,
                data: {},
              });
        }
       }
       else{
        return res.status(401).json({
          statusCode: 401,
          message: `Invalid BLog id`,
          data: {},
        });
       }
  
    }
}
catch (error)
{
  return res.status(401).json({
    statusCode: 401,
    message: error,
    data: {},
  });
}

});

/* Get all the blogs */
app.get('/api/allblogs', async (req, res) => {
  // sort from the latest to the earliest
  const posts = await Blogs.find().sort({ createdAt: 'desc' });
  if (posts != null)
  {
    return res.status(200).json({
      statusCode: 200,
      message: 'Fetched all blogs',
      data: { posts },
    });
  }
  else
  {
    return res.status(200).json({
      statusCode: 200,
      message: 'No blog exists',
      data: { },
    });
  }

}); 

/* Get a particular blog by author or filtered by combination of author and banner id (considering banner id is used for blog topic */
app.get('/api/getblog', async (req, res) => {
  // sort from the latest to the earliest
//  const posts = await Blogs.find().sort({ createdAt: 'desc' });
if (req.body.author)
{
  if (mongoose.isValidObjectId(req.body.author))
    {
      if(req.body.banner) // If blog_id is sent then filter by author and blog_id
      {
         posts =  await Blogs.find({ author: req.body.author, blog_id: req.body.banner});
      }
      else // if no blog_id sent then filter by author id  only
      {
         posts =  await Blogs.find({ author: req.body.author});
      }
      if (posts != null)
      {
        return res.status(200).json({
          statusCode: 200,
          message: 'blogs received ',
          data: { posts },
        });
      }
      else{
        return res.status(200).json({
          statusCode: 200,
          message: 'No blogs to return ',
          data: {  },
        });
  
      }
  }
  else{
    return res.status(401).json({
      statusCode: 401,
      message: `Invalid Author detail`,
      data: {},
    });
   }

}
else
{
  if(req.body.banner) // If blog_id is sent then filter by author and blog_id
  {
     posts =  await Blogs.find({blog_id: req.body.banner});
  }
  if (posts != null)
  {
    return res.status(200).json({
      statusCode: 200,
      message: 'blogs received ',
      data: { posts },
    });
  }
  else{
    return res.status(200).json({
      statusCode: 200,
      message: 'No blogs to return ',
      data: {  },
    });

  }

}

}); 

// Default route
app.get('/', (req, res) => {
  //res.send('Welcome to Animimic API');
  var clientIp = requestIp.getClientIp(req);
  res.send(`Welcome ${clientIp}.`);
});

// Using cors as a middleware
app.get('/user-auth-api-articles',cors(),
    (req,res) => res.json('user-auth-api-articles'))

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});