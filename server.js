if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require('express-flash')
const session = require('express-session')



const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const users = [];

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
  })

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  })

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
  })

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
});



// app.use(function (req, res, next) {
//   console.log(req.url)
//   var token = req.headers['x-access-token'];
//   var refreshtoken = req.headers['refresh-token'];
//   if (refreshtoken) {
//     jwt.verify(refreshtoken, config.jwt_secret, function (err, decoded) {
//       if (err) {
//         res.setHeader('Authentication', false)
//         return res.json({ status: false, Authentication: false, message: "Failed to authenticate token.", invalidToken: true });
//       } else {
//         res.setHeader('Authentication', true)
//         req.decoded = decoded;
//         var newtoken = jwt.sign({ "email": req.decoded.email, "user_id": req.decoded.user_id, "user_type": req.decoded.user_type }, config.jwt_secret, {
//           expiresIn: "24h"
//         });
//         var newrefreshtoken = jwt.sign({
//           "email": req.decoded.email,
//           "user_id": req.decoded.user_id,
//           "first_name": req.decoded.first_name,
//           "last_name": req.decoded.last_name,
//           "user_type": req.decoded.user_type
//         },
//           config.jwt_secret, {
//           expiresIn: "240000h"
//         });
//         res.setHeader('x-access-token', newtoken)
//         res.setHeader('refresh-token', newrefreshtoken)
//         next();
//       }
//     });
//   } else {
//     if (token) {
//       jwt.verify(token, config.get("jwt_secret"), function (err, decoded) {
//         if (err) {

//           res.setHeader('Authentication', false)
//           return res.json({ status: false, Authentication: false, message: "Failed to authenticate token2.", invalidToken: true });

//         } else {
//           res.setHeader('Authentication', true)
//           req.decoded = decoded;
//           next();
//         }
//       });
//     } else {

//       res.setHeader('Authentication', false)
//       return res.json({
//         status: false,
//         message: "Failed to authenticate token3.",
//       })
//     }
//   }
// });






app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(3000);
