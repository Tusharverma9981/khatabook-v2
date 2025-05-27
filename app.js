const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./model/user.model');

require('dotenv').config();


const app = express()

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

app.get('/', (req, res) => {
  res.render('index',);
})

app.get('/register', (req, res) => {
  res.render('register');
})


app.get('/home', (req, res) => {
  res.render('home');
})

app.post('/login',async (req, res) => {
   try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
     return res.render('error', { message: 'Invalid email' });
    }

    // Check password (plain text check here - use bcrypt for production)
    if (user.password !== password) {
      return res.render('error', { message: 'Invalid email or password' });
    }
    res.redirect('/home');
  } catch (err) {
      res.render('error', { message: err.message })
  }
})



app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const newUser =await new User({ username, email, password });
    await newUser.save();
    res.redirect('/home');

  } catch (err) {
   res.render('error', { message: err.message })
  }
});


app.listen(3000)
