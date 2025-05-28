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
app.get('/login', (req, res) => {
  res.render('index');
})

app.get('/register', (req, res) => {
  res.render('register');
})

//these are for the main usage
app.get('/', authMiddleware,async (req, res) => {
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

    res.redirect('/');
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
    res.redirect('/login');

  } catch (err) {
   res.render('error', { message: err.message })
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect("/login");
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
    res.redirect('/');
  } catch (err) {
    console.error(err);
       return res.render('error', { message: "Error creating Hisaab"  });
  }
});

app.get('/hisaab/:id',authMiddleware,async (req,res)=>{
  try {
    const hisaab = await Hisaab.findById(req.params.id);
    if(hisaab.encrypted){
      return res.render('unlock',{hisaab})
    }
    
    res.render('hisaab', { hisaab });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Error fetching Hisaab' });
  }
})

app.get('/hisaab/:id/edit', authMiddleware, async (req, res) => {
  try {
    const hisaab = await Hisaab.findById(req.params.id);
   
    res.render('edit', { hisaab });
  } catch (err) {
    res.render('error', { message: 'Error loading edit form' });
  }
});

app.post('/hisaabs/:id/edit', authMiddleware, async (req, res) => {
  try {
    const { title, label, encrypted, password, keys, values } = req.body;
    //console.log(title,label,keys,values,encrypted,password);
    
    // Create new content array from key/value inputs
    const content = keys.map((key, i) => ({
      key,
      value: values[i]
    }));

    await Hisaab.findOneAndUpdate(
      { _id: req.params.id},
      {
        title,
        label,
        encrypted: encrypted === 'on',
        password: encrypted === 'on' ? password : null,
        content
      },
      { new: true }
    );

    res.redirect(`/`);
  } catch (err) {
    console.log(err);
    
    res.render('error', { message: 'Error updating Hisaab' });
  }
});

// DELETE route to remove a Hisaab
app.post('/hisaabs/:id/delete', authMiddleware , async (req, res) => {
  try {
    const hisaab = await Hisaab.findOneAndDelete({
      _id: req.params.id, 
     // Ensures only the owner can delete
    });

   

    res.redirect('/');
  } catch (err) {
    res.status(500).render('error', { message: 'Error deleting Hisaab' });
  }
});

app.post('/unlock/:id',async (req,res)=> {
  const hisaab = await Hisaab.findById(req.params.id);
  const {password} = req.body;
   const isMatch = await bcrypt.compare(password, hisaab.password);
  if (isMatch) {
    return res.render('hisaab', { hisaab });
  }
  res.render('error', { message: "Access Denied"  });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
