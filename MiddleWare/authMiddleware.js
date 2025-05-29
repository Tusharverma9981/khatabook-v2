const jwt = require('jsonwebtoken');
const User = require('../model/user.model');


require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
     res.render('error', { message: err.message })
  }
};

module.exports = authMiddleware;
