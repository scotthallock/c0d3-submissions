const express = require('express');
const router = express.Router();
const path = require('path');
const jsonParser = require('body-parser').json();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { appendFile } = require('fs');
const { nextTick } = require('process');


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
    if (!username || !/^\w+$/.test(username)) {
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
            password: hashedPassword,
            // other key-value pairs
        };
        users.push(user);
        return res.sendStatus(201);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/* POST /api/sessions to create a new session (aka login a user) */
/* AUTHENTICATION - when the user successfully logs in using their 
   credentials, a JSON Web Token will be returned. */
router.post('/api/sessions', jsonParser, async (req, res) => {
    /* username field can be either username or email */
    /* password field must match the password for the user */

    const user = users.find(e => e.username === req.body.username);
    if (!user) {
        return res.status(400).json('User not found');
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            // credentials are correct, create a JWT
            return res.json({user, jwt: jwt.sign(user, 'secret password')});
        }
        res.status(400).json('Wrong credentials');
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }

});

/* GET /api/sessions to get the currently logged in user */
/* AUTHORIZATION - */
router.get('/api/sessions', (req, res) => {
    /* The value for the 'Authorization' header should be 'Bearer [jwt]' */
    const authHeader = req.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);
    if (!token) {
        return res.status(401).json('Unauthorized: "Authorization" header lacks valid token or is incorrectly formatted');
    }
    /* Asynchronous verify token */
    jwt.verify(token, 'secret password', (err, user) => {
        if (err) return res.status(403).json('Token verification bad');
        return res.json(user);
    });
});

/* Middleware - authenticate token */
/* Once the user is logged in, each subsequent request will include the JWT,
   allowing the user to access routes, services, and resources that are
   permitted with that token. */





module.exports = router;