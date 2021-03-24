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

app.post('/auth/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { username: req.body.username, password: hashedPassword }

        connection.query('INSERT INTO users (username, password) VALUES(?, ?)', [user.username, user.password], function (err, result) {
            if (err) throw err
            res.status(201).send("New user created")
        })

    } catch {
        res.status(500).send()
    }
})

app.post('/auth/login', async (req, res) => {
    const username = req.body.username;
	const password = req.body.password;

	if (username && password) {
		  connection.query('SELECT * FROM users WHERE username = ?', [username], async function(error, results, fields) {
			if (results.length > 0) {
                if(await bcrypt.compare(password, results[0].password)) {
                  req.session.loggedIn = true;
                  res.send('Logged in');
                  } else {
                    res.send('Not Allowed')
                  }
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
		});
	} else {
		res.status(500).send('Please enter Username and Password!');
		res.end();
	}
})

app.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => { })
    res.send('Session ended')
})

app.get('/events', (req, res) => {
    connection.query('SELECT * FROM events', function (err, rows, fields) {
        if (err) throw err
      
        res.status(200).send(rows)
    }) 
})

app.post('/events', (req, res) => {
    if (req.session.loggedIn){
      const event = {
        name: req.body.name,
        date: req.body.date,
        date_created: "2021-03-20",
        users: req.body.users,
        roles: req.body.roles,
        created_by: 1
      }
      
      connection.query('INSERT INTO events (name, date, date_created, users, roles, created_by) VALUES(?, ?, ?, ?, ?, ?)', [event.name, event.date, event.date_created, event.users, event.roles, event.created_by], function (err, result) {
        if (err) throw err;
        res.status(200).send("Event added");
      });
    } else {
      res.status(401).send("User unauthorized");
    }
})

app.listen(process.env.API_PORT, () => {console.log("API started on port: " + process.env.API_PORT)})