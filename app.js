const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
authMiddleware = require('./MiddleWare/authMiddleware');

require('dotenv').config();


const app = express()
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));


//these are the routes for the application
app.get('/', (req, res) => {
  res.render('index');
})

app.get('/register', (req, res) => {
  res.render('register');
})

//these are for the main usage
app.get('/home', authMiddleware,(req, res) => {
  res.render('home',{ username: req.user.username });
})


//and these are the routes for the login and register pages mainly for authentication
app.post('/login',async (req, res) => {
   try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
     return res.render('error', { message: 'Invalid email' });
    }

     // Compare password with the hashed one
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render('error', { message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      maxAge: 3600000
        });

    res.redirect('/home');
  } catch (err) {
    

      res.render('error', { message: err.message })
  }
})

app.post('/register', async (req, res) => {
    
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); 

    //bycrypt is used to hash the password before saving it to the database
    const newUser =await new User({ username, email, password: hashedPassword  });
    await newUser.save();
    res.redirect('/');

  } catch (err) {
   res.render('error', { message: err.message })
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.send('Logged out');
});




app.listen(3000)
