const express = require('express')
const session = require('express-session')

const app = express()
const bcrypt = require('bcrypt')
const mysql = require('mysql')

require('dotenv').config()

app.use(express.json())

app.use(session({
    secret: process.env.APP_SECRET,
    name: 'Auth session',
    saveUninitialized: false,
    resave: true
}))

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

connection.connect()

app.listen(process.env.API_PORT, () => {console.log("API started on port: " + process.env.API_PORT)})