/* Create router for JS5 Challenge 5 - Chatroom */
const express = require('express');
const router = express.Router();
const path = require('path');
const jsonParser = require('body-parser').json();
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);
const chatbots = require('./chatbots');
const app = express();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p5/js5-p5.html'));
});

/**
 * MIDDLEWARE: get user data (username, email, etc.) from the JSON Web Token (JWT).
 * Every request to this server should include an 'Authorization' header.
 * This middleware will set the user data into the request object. The user data
 * will look like one of the objects below:
 *   1) {username: '...', name: '...', email: '...', id: '...', jwt: '...'}
 *   2) {data: {message: 'Not logged in'}}
 */
router.use('*', (req, res, next) => {
    fetch('https://js5.c0d3.com/auth/api/session', {
        headers: {
            Authorization: req.get('Authorization')
        }
    })
        .then(res => res.json())
        .then(data => {
            req.user = data;
            next();
        })
        .catch(console.error);
});

/* Send the user data that was set in the middleware */
router.get('/api/session', (req, res) => {
    return res.status(200).json(req.user);
});

/* Check if the chatroom in the url exists */
router.get('/:room', (req, res) => {
    const roomExists = allChatrooms.some(e => e.name === req.params.room);
    if (!roomExists) {
        return res.status(404).send(`This chatroom doesn't exist.`);
    }
    res.sendFile(path.join(__dirname, '../../public/js5-p5/js5-p5.html'));
});

/* Get the chatroom's messages */
router.get('/api/:room/messages', (req, res) => {
    const name = req.params.room;
    const room = allChatrooms.find(e => e.name === name);
    res.status(200).json(room.getMessages());
});

/* Post a message in the chatroom */
router.post('/api/:room/messages', jsonParser, (req, res) => {
    const name = req.params.room;
    const user = req.user.username;
    const time = req.body.time;
    const message = req.body.message;
    const room = allChatrooms.find(e => e.name === name);
    /* Add the message to the chatroom */
    room.messages.push( {user, time, message} );
    res.sendStatus(200);
});

/* Send chatroom names and descriptions */
router.get('/api/rooms', (req, res) => {
    const data = allChatrooms.map(e => {
        return {
            name: e.name,
            description: e.description
        };
    });
    res.status(200).json(data);
});

/* Create a new chatroom */
router.post('/api/rooms', jsonParser, (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    /* If a room with that name already exists, reject it */
    const isDuplicate = allChatrooms.some(e => {
        return e.name.toLowerCase() === name.toLowerCase();
    });
    if (isDuplicate) {
        return res.status(400).json({error: {message: 'Room with that name already exists.'}})
    }
    allChatrooms.push(new Chatroom(name, description));
    res.status(200).json('OK');
});

/* Class definition for Chatroom */
class Chatroom {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.messages = [];
    }
    addMessage(user, time, message) {
        this.messages.push({
            user,
            time,
            message
        });
        if (this.messages.length >= 100) { // only store last 100 messages
            this.messages.shift();
        }
    }
    getMessages() {
        return this.messages.map(e => {
            return {
                user: e.user,
                time: dayjs(e.time).fromNow(), // e.g. '4 minutes ago'
                message: e.message
            };
        });
    }
}

/****************************************************************************/
/* Fun stuff - add default chatrooms with some randomly generated messages. */
/****************************************************************************/

/* Set up default chatrooms */
const allChatrooms = [
    new Chatroom('Shakespeare', 'The best quotes from the works of William Shakespeare.'),
    new Chatroom('Cats and Dogs', 'Get in touch with other house pets around the world. No fighting, please.')
];

/* Helper function: return a random element from the input array */
const randElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* 'Shakespeare' chatroom */
const shakespeareRoom = allChatrooms.find(e => e.name === 'Shakespeare');
const shakespearePost = () => {
    shakespeareRoom.messages.push({
        user: randElement(chatbots.shakespeareBots),
        time: Date.now(),
        message: randElement(chatbots.shakespeareQuotes)
    });
    setTimeout(shakespearePost, 1000 * 20);
};
shakespearePost();

/* 'Cats and Dogs' chatroom */
const catsAndDogsRoom = allChatrooms.find(e => e.name === 'Cats and Dogs');
const catsAndDogsPost = () => {
    const coin = (Math.random() > 0.5);
    catsAndDogsRoom.messages.push({
        user: randElement(coin ? chatbots.catBots : chatbots.dogBots),
        time: Date.now(),
        message: randElement(coin ? chatbots.catQuotes : chatbots.dogQuotes)
    });
    setTimeout(catsAndDogsPost, 1000 * 10);
};
catsAndDogsPost();

module.exports = router;