const express = require('express');
const router = express.Router();
const path = require('path');
const jsonParser = require('body-parser').json();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET = 'not_so_secret_am_i_?';

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p6/js5-p6.html'));
});

const users = [];

/* For testing purposes - send users array to client */
router.get('/api/users', (req, res) => {
    res.json(users);
});

/* Create a new user */
router.post('/api/users', jsonParser, async (req, res) => {
    const { username, email, password, ...others } = req.body;
    // const password = Buffer.from(req.body.password, 'base64'); // same as atob()

    /* Input validation */
    if (!password || password.length <= 5) {
        return res.status(400).json({ "error": { "message":
            "password field cannot be empty and must be base 64 encoded with more than 5 characters" } });
    }
    if (!username || !/^\w+$/.test(username)) {
        return res.status(400).json({ "error": { "message":
            "username field cannot be blank and must contain alpha numeric characters only" } });
    }
    if (users.some(e => e.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ "error": { "message":
            "username is taken, please pick another" } });
    }
    if (!email || !email.includes('@')) {
        return res.status(400).json({ "error": { "message":
            "email field cannot be blank and must be a valid email" } });
    }
    if (users.some(e => e.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({"error": {"message":
            "there is already an account with that email"}});
    }

    /* create user object, hash the password, and add a JWT */
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = {
            'username': username,
            'email': email,
            'password': hashedPassword,
            ...others,
            'jwt': jwt.sign({ username }, SECRET)
        };
        users.push(user);
        return res.status(201).send(user);
    } catch (err) {
        console.error(err);
        res.send(500).json('Internal server error');
    }
});

/* Login a user */
router.post('/api/sessions', jsonParser, async (req, res) => {
    const { username, password } = req.body;
    /* username field can be either username or email */
    const user = users.find(e => {
        return (e.username === username) ||
               (e.email === username);
    });
    if (!user) {
        return res.status(400).json('User not found');
    }
    try {
        if (await bcrypt.compare(password, user.password)) {
            /* Credentials are correct, create a new JWT and send back the user */
            user.jwt = jwt.sign({ username }, SECRET);
            return res.json(user);
        }
        res.status(400).json('Wrong credentials');
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

/* Get currently logged in user */
router.get('/api/sessions', (req, res) => {
    /* The value for the 'Authorization' header should be 'Bearer [jwt]' */
    const authHeader = req.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json('Unauthorized - no token provided');
    }
    try {
        const decoded = jwt.verify(token, SECRET);
        const user = users.find(e => e.username === decoded.username);
        return res.json(user);
    } catch (err) {
        return res.status(400).json({ error: "Invalid token" });
    }
});

module.exports = router;