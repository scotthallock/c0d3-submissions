const express = require('express');
const router = express.Router();
const path = require('path');
const jsonParser = require('body-parser').json();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { appendFile } = require('fs');


router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p6/js5-p6.html'));
});

const users = [];

/* This is for TESTING PURPOSES ONLY */
router.get('/api/users', (req, res) => {
    res.json(users);
});

/* POST /api/users to create a new user */
router.post('/api/users', jsonParser, async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    /* password cannot be blank and must be >5 characters */
    if (!password || password.length <= 5) {
        return res.status(400).json({error: {message: 'password cannot be blank and must be at least 6 characters long'}});
    }
    /* username cannot be blank and must be alphanumeric */
    if (!username || !/^\w+$/.test(password)) {
        return res.status(400).json({error: {message: 'username cannot be blank and can only contain letters, numbers, and "_"'}});
    }
    /* username must be unique */
    if (users.some(e => e.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({error: {message: 'username already taken'}});
    }
    /* email must contain a @ symbol */
    if (!email || !email.includes('@')) {
        return res.status(400).json({error: {message: 'email cannot be blank and must include the "@" character'}});
    }
    /* email must be unique */
    if (users.some(e => e.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({error: {message: 'there is already an account with that email'}});
    }
    /* Users should be able to pass in any additional key/value data pairs in the body */
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        };
        console.log(salt);
        console.log(hashedPassword);
        users.push(user);
        res.sendStatus(201);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/* POST /api/sessions to create a new session (aka login a user) */
router.post('/api/sessions', jsonParser, async (req, res) => {
    /* username field can be either username or email */
    /* password field must match the password for the user */

    const user = users.find(e => e.username === req.body.username);
    if (!user) return res.status(400).json('User not found');
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            // correct username + password combination
            
        } else {
            res.status(400).json('Wrong credentials');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }

});

/* GET /api/sessions to get the currently logged in user */
router.get('/api/sessions', (req, res) => {
    const clientJWT = req.get('Authorization');
});


/**
 * AUTHENTICATION - Take a username and password, make sure they are correct (log in a user)
 * AUTHORIZATION - Making sure the user that sent the request to the server is the same
 *                 user that logged in during the authentication process.
 */


module.exports = router;