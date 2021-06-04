const e = require("express");
const express = require("express");
const router = express.Router();
const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

connection.connect();

router.get("/:name", (req, res) => {
  try {

    const getSingleSubredditStatement = `
      SELECT * FROM subreddits
      WHERE name = '${req.params.name}'
    `

    connection.query(getSingleSubredditStatement, (err, rows) => {
      if(err) throw err
      res.send(rows[0])
    })
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
})

router.get("/", (req, res) => {
  try{
    connection.query('SELECT * FROM subreddits', (err, rows) => {
      res.send(rows)
    })
  } catch (e) {
    console.log("ERRORRRRRR")
    res.status(400).send({ error: e.message })
  }
})

router.post("/", (req, res) => {
  try {

    const insertSubredditStatement = `
    INSERT INTO subreddits 
    (name, description, created_at) 
    VALUES ('${req.body.name}', '${req.body.description}', '${req.body.createdAt}')`

    connection.query(insertSubredditStatement)

    res.send("Subreddit added")

    

  } catch (e) {
    res.status(409).send({ error: 'A subreddit with this name already exists' })
  }
})

module.exports = router