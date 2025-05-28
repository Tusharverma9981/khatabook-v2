const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./MiddleWare/authMiddleware');
const Hisaab = require("./model/hisaab.model")

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
app.get('/home', authMiddleware,async (req, res) => {
    try {
    const userId = req.user._id;
    // Fetch all hisaabs created by this user
    const hisaabs = await Hisaab.find({ createdBy: userId });
    
    res.render('home', { hisaabs });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Failed to load hisaabs' });
  }
})

app.get('/create', (req,res)=>{
  res.render('create')
});


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
  res.redirect("/");
});


//routes for hisaab crud
app.post('/create',authMiddleware, async (req, res) => {
  try {
    const { title, key, value, encrypted, password, label } = req.body;
    

    // Construct content from key[] and value[]
    const content = [];
    if (Array.isArray(key) && Array.isArray(value)) {
      for (let i = 0; i < key.length; i++) {
        if (key[i] && value[i]) {
          content.push({ key: key[i], value: parseFloat(value[i]) });
        }
      }
    }

    const newHisaab = new Hisaab({
      title,
      label,
      content,
      encrypted: encrypted === 'on',
      createdBy: req.user._id,
    });

    if (newHisaab.encrypted) {
      if (!password) return res.status(400).send("Password required");
      const hashedPassword = await bcrypt.hash(password, 10);
      newHisaab.password = hashedPassword;
    }

    await newHisaab.save();
    res.redirect('/home');
  } catch (err) {
    console.error(err);
       return res.render('error', { message: "Error creating Hisaab"  });
  }
});




app.listen(3000)
