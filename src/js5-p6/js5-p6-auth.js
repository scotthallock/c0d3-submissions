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

/* All users created since server start */
const users = [];

/* For testing purposes - send users array to client */
router.get('/api/users', (req, res) => {
    res.json(users);
});

/* Create a new user */
router.post('/api/users', jsonParser, async (req, res) => {
    const { username, email, password, ...others } = req.body;
    const decodedPassword = Buffer.from(password, 'base64').toString('ascii'); // atob()

    /* Input validation */
    if (!decodedPassword || decodedPassword.length <= 5) {
        return res.status(400).json({ 'error': { 'message':
            'password field cannot be empty and must have 6 or more characters' } });
    }
    if (!username || !/^\w+$/.test(username)) {
        return res.status(400).json({ 'error': { 'message':
            'username field cannot be blank and must contain alpha numeric characters only' } });
    }
    if (users.some(e => e.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ 'error': { 'message':
            'username is taken, please pick another' } });
    }
    if (!email || !email.includes('@')) {
        return res.status(400).json({ 'error': { 'message':
            'email field cannot be blank and must contain a \'@\' character' } });
    }
    if (users.some(e => e.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({'error': {'message':
            'there is already an account with that email'} });
    }

    /* create user object, hash the password, and add a JWT */
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(decodedPassword, salt);
        const user = {
            'username': username,
            'email': email,
            'password': hashedPassword,
            ...others,
            'jwt': jwt.sign({ username }, SECRET, {expiresIn: '30s'})
        };
        users.push(user);
        return res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.send(500).json('Internal server error');
    }
});

/* Login a user */
router.post('/api/sessions', jsonParser, async (req, res) => {
    const { username, password } = req.body;
    const decodedPassword = Buffer.from(password, 'base64').toString('ascii'); // atob()

    /* username field can be either username or email */
    const user = users.find(e => {
        return (e.username === username) || (e.email === username);
    });
    if (!user) {
        return res.status(400).json({'error': {'message':
            'User not found'} });
    }

    const passwordIsCorrect = await bcrypt.compare(decodedPassword, user.password);
    if (passwordIsCorrect) {
        /* Create a new JWT for the user */
        user.jwt = jwt.sign(
            { 'username': user.username },
            SECRET,
            {expiresIn: '30s'}
        );
        return res.json(user);
    }
    return res.status(400).json({'error': {'message':
        'Wrong credentials'} });
});

/* Get currently logged in user */
router.get('/api/sessions', (req, res) => {
    /* The value for the 'Authorization' header should be 'Bearer [jwt]' */
    const authHeader = req.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({'error': {'message':
            'Unauthorized - no token provided'} });
    }
    try {
        const decoded = jwt.verify(token, SECRET);
        const user = users.find(e => e.username === decoded.username);
        return res.json(user);
    } catch (err) {
        // token is wrong or expired
        return res.status(403).json({'error': {'message': err.message} });
    }
});

module.exports = router;