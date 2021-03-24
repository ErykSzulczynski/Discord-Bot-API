const express = require('express')
const session = require('express-session')

require('dotenv').config();

const app = express()
const bcrypt = require('bcrypt')

app.listen(process.env.API_PORT, () => {console.log("API started on port: " + process.env.API_PORT)})