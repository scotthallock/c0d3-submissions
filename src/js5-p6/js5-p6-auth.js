const express = require('express');
const router = express.Router();
const cors = require('cors');
const path = require('path');
const jsonParser = require('body-parser').json();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'not_very_secret_am_i_?';

/* Storage for all users */
const users = {};

/* For test purposes - add some users to the array */
(async () => {
    const salt = await bcrypt.genSalt();
    users['fishing_freak'] = {
        username: 'fishing_freak',
        email: 'fishingislife@gmail.com',
        password: await bcrypt.hash('ilovefishing123', salt)
    };
    users['chicagoDawg'] = {
        username: 'chicagoDawg',
        email: 'doggydog@hotmail.com',
        password: await bcrypt.hash('must4rd&rel1sh', salt)
    };
})();

/* Check user signup fields are valid */
const validateSignUp = async (username, email, password) => {
    if (password.length <= 5) {
        return 'Password must have 6 or more characters';
    }
    if (!(/^\w+$/.test(username))) {
        return 'Username field must contain alphanumeric characters only';
    }
    if (Object.values(users).some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return 'Username is taken, please pick another';
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        return 'Email must be properly formatted';
    }
    if (Object.values(users).some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return 'There is already an account with that email address';
    }
    return undefined; // nothing wrong with signup fields
};

const findUserByUsernameOrEmail = (usernameOrEmail) => {
    if (users[usernameOrEmail]) return users[usernameOrEmail];
    const user = Object.values(users).find(u => u.email === usernameOrEmail);
    console.log({user});
    if (user) return user;
    return undefined; // user not found
};

const signToken = (payload) => {
    return jwt.sign({ payload }, JWT_SECRET, {expiresIn: '30s'});
};

/********************
 * REQUEST HANDLERS *
 ********************/

/* Serve /auth page */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p6/js5-p6.html'));
});


/* Allow Cross-Origin Resource Sharing (CORS) for /auth/api/* */
router.use('/api/*', cors());


/* For demo purposes - send users array to client */
router.get('/api/users', (req, res) => {
    const usersWithPasswordsRemoved = Object.keys(users).reduce((acc, username) => {
        const { ...copy } = users[username];
        delete copy.password;
        acc[username] = copy;
        return acc;
    }, {});
    res.json(usersWithPasswordsRemoved);
});


/* Create a new user */
router.post('/api/users', jsonParser, async (req, res) => {
    const { username, email, password, ...others } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: { message: 'Must include username, email, and password' } });
    }
    const decodedPassword = Buffer.from(password, 'base64').toString('ascii'); // atob()

    const errorMessage = await validateSignUp(username, email, decodedPassword);
    if (errorMessage) return res.status(400).json({ error: { message: errorMessage } });

    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(decodedPassword, salt);
        users[username] = {
            username,
            email,
            password: hashedPassword,
            ...others
        };
        return res.status(201).json({
            username,
            email,
            jwt: signToken(username)
        });
    } catch (err) {
        return res.send(500).json({ error: { message: err.message } });
    }
});

/* Login a user */
router.post('/api/sessions', jsonParser, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: { message: 'Must include username and password' } });
    }

    const user = findUserByUsernameOrEmail(username);
    if (!user) return res.status(400).json({ error: { message: 'User not found' } });

    const decodedPassword = Buffer.from(password, 'base64').toString('ascii'); // atob()

    const passwordIsCorrect = await bcrypt.compare(decodedPassword, user.password);
    if (passwordIsCorrect) {
        const { username, email } = user;
        return res.json({
            username,
            email,
            jwt: signToken(username)
        });
    }
    return res.status(400).json({error: {message: 'Wrong credentials'} });
});


/* Get currently logged in user */
router.get('/api/sessions', (req, res) => {
    /* The value for the 'Authorization' header should be 'Bearer [jwt]' */
    const authHeader = req.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({error: {message: 'Unauthorized - no token provided'} });

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // will throw error if invalid token
        const { username, email } = users[decoded.payload];
        return res.json({
            username,
            email,
            jwt: token
        });
    } catch (err) {
        return res.status(403).json({error: {message: err.message} });
    }
});

module.exports = router;