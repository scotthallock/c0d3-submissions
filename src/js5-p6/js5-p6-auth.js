const express = require('express');
const router = express.Router();
const path = require('path');
const jsonParser = require('body-parser').json();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'not_very_secret_am_i_?';

/* Array of all users */
const users = [];

/* For test purposes - add some users to the array */
(async () => {
    let salt = await bcrypt.genSalt();
    users.push({
        username: 'fishing_freak',
        email: 'fishingislife@gmail.com',
        password: await bcrypt.hash('ilovefishing123', salt)
    });
    salt = await bcrypt.genSalt();
    users.push({
        username: 'chicagoDawg',
        email: 'doggydog@hotmail.com',
        password: await bcrypt.hash('must4rd&rel1sh', salt)
    });

})();

/* Check user signup fields are valid */
const validateSignUp = async (username, email, password) => {
    if (!password || password.length <= 5) {
        return 'password field cannot be empty and must have 6 or more characters';
    }
    if (!username || !/^\w+$/.test(username)) {
        return 'username field cannot be blank and must contain alpha numeric characters only';
    }
    if (users.some(e => e.username.toLowerCase() === username.toLowerCase())) {
        return 'username is taken, please pick another';
    }
    if (!email || !email.includes('@')) {
        return 'email field cannot be blank and must contain a \'@\' character';
    }
    if (users.some(e => e.email.toLowerCase() === email.toLowerCase())) {
        return 'there is already an account with that email';
    }
    return null;
};

/********************
 * REQUEST HANDLERS *
 ********************/

/* Serve /auth page */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p6/js5-p6.html'));
});

/* Allow Cross-Origin Resource Sharing (CORS) for /auth/api/* */
router.options('/api/*', (req, res) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Credentials'
    );
    res.send('ok');
  })


/* For demo purposes - send users array to client */
router.get('/api/users', (req, res) => {
    res.json(users);
});

/* Create a new user */
router.post('/api/users', jsonParser, async (req, res) => {
    const { username, email, password, ...others } = req.body;
    if (typeof password !== 'string') {
        return res.status(400).json({ error: { message:
            'password missing in the request body' } });
    }
    const decodedPassword = Buffer.from(password, 'base64').toString('ascii'); // atob()

    /* Input validation */
    const errorMessage = await validateSignUp(username, email, decodedPassword);
    if (errorMessage) return res.status(400).json({ error: { message: errorMessage } });

    /* create user object, hash the password, and add a JWT */
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(decodedPassword, salt);
        const user = {
            'username': username,
            'email': email,
            'password': hashedPassword,
            ...others,
            'jwt': jwt.sign({ username }, JWT_SECRET, {expiresIn: '30s'})
        };
        users.push(user);
        return res.status(201).json(user);
    } catch (err) {
        console.error(err);
        return res.send(500).json('Internal server error');
    }
});


/* Login a user */
router.post('/api/sessions', jsonParser, async (req, res) => {
    const { username, password } = req.body;
    const decodedPassword = Buffer.from(password, 'base64').toString('ascii'); // atob()

    /* allow user to login with username or email in the username field*/
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
            JWT_SECRET,
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
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(e => e.username === decoded.username);
        return res.json(user);
    } catch (err) {
        /* token is wrong or expired */
        return res.status(403).json({'error': {'message': err.message} });
    }
});

module.exports = router;