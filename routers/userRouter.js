const express = require("express");
const router = express.Router();
const db = require("../db")
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("../middleware/passportConfig")(passport);
const { check, param } = require("express-validator")
const returnErrors = require("../middleware/validatorErrors")
require("dotenv").config();


// Get User
router.get("/get-user/:username", [
  param('username').notEmpty().withMessage('Must include a username to get a user')
], (req, res) => {

  const validatorFailed = returnErrors(req, res)

  if(validatorFailed) return 

  const { username } = req.params

  let searchForUserStatement = `
      SELECT id, username, gender, profile_picture, created_at, updated_at FROM users 
      WHERE username = ?
      LIMIT 1
  `;

  db.query(searchForUserStatement, [username], (err, rows) => {
      if (err) throw err;
      res.send(rows[0])
  })
});



// Log In
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) {
      console.log("No user exists, ", info);
    } else {
      console.log("User found", user);
      req.login(user, (err) => {
        if (err) throw err;
        res.send("Successfully authenticated");
      });
    }
  })(req, res, next);
});



// Log Out
router.post("/logout", (req, res, next) => {
  console.log("logging out " + req.user.username);
  req.logout();
  req.session.destroy((err) => {
    if (err) return next(err);
    return res.send({ authenticated: req.isAuthenticated() });
  });
});


// Register
router.post("/register", [
  check('username').notEmpty().withMessage('Username cannot be empty').trim().escape(),
  check('gender').notEmpty().withMessage('Gender cannot be empty').trim().escape(),
  check('profilePicture').notEmpty(),
  check('updatedAt').notEmpty()
],(req, res) => {

  const validatorFailed = returnErrors(req, res)

  if(validatorFailed) return 

  const { username } = req.params

  let searchForUserStatement = `
        SELECT * FROM users 
        WHERE username = ? 
        LIMIT 1
    `;

  db.query(searchForUserStatement, [username], async (err, rows) => {
    if (err) throw err;
    if (rows[0]) {
      console.log("User Exists");
    }
    if (!rows[0]) {

      const { username, gender, profilePicture, updatedAt } = req.body

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      let insertUserStatement = `
        INSERT INTO users 
        (username, password, gender, profile_picture, updated_at) 
        VALUES 
        (?, ?, ?, ?, ?)
      `;

      db.query(insertUserStatement, [username, hashedPassword, gender, profilePicture, updatedAt],  (err) => {
        if(err) console.log(err)
        if (err) throw err;
        res.send(req.body);
        console.log("Registered user into database");
      });
    }
  });
});

module.exports = router;
