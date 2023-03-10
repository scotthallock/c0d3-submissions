import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas, loadImage } from 'canvas';
import { promises as fsp } from 'fs';
import defaultMemes from './defaultMemes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const uploadsDirectory = path.join(__dirname, '../../public/js5-p9/uploads');
const iconsDirectory = path.join(__dirname, '../../public/js5-p9/icons');

const sessions = {};
const onlineUsers = new Set(); // so we can do O(1) lookup of users
const memes = defaultMemes;

const createMeme = async (username, isStreaming, image, captionTop, captionBot) => {
    const filename = username + '.png'
    const filepath = uploadsDirectory + '/' + filename;

    try {
        // use webcam capture OR a random image from loremflickr
        if (isStreaming) {
            await fsp.writeFile(filepath, image, {encoding: 'base64'});
        } else {
            const response = await fetch('https://loremflickr.com/640/480');
            const arrBuffer = await response.arrayBuffer();
            await fsp.writeFile(filepath, Buffer.from(arrBuffer), {encoding: 'base64'});
        }

        // load image to draw onto canvas
        const loadedImage = await loadImage(filepath);
        const canvas = createCanvas(640, 480);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(loadedImage, 0, 0, 640, 480);

        // set up ctx
        ctx.font = '60px Impact Arial sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.miterLimit = 2;
        ctx.fillStyle = 'white';
        const centerX = canvas.width / 2;
        const topY = 70;
        const botY = 450;
        
        // add captions
        ctx.strokeText(captionTop, centerX, topY);
        ctx.fillText(captionTop, centerX, topY);
        ctx.strokeText(captionBot, centerX, botY);
        ctx.fillText(captionBot, centerX, botY);

        // overwrite the saved image with the meme
        const buffer = canvas.toBuffer("image/png");
        await fsp.writeFile(filepath, buffer);

        const meme = {
            username, 
            filename,
            createdAt: Date.now()
        };
        memes[username] = meme;
        return meme;
    } catch (err) {
        console.error(err);
    }
};

const validateUsername = (username) => {
    if (!username) return 'Please include username in request';
    if (onlineUsers.has(username)) return 'That name is currently taken';
    if (username.length > 20) return 'Limit 20 characters';
    if (!(/^\w+$/.test(username))) return 'Letters, numbers, and underscores only';
    return undefined;
};

router.use(express.json({limit: '10mb'}));

router.use('/uploads', express.static(uploadsDirectory));
router.use('/icons', express.static(iconsDirectory));

/* External style sheet */
router.get('/js5-p9-styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p9/js5-p9-styles.css'));
});

/* Using timeago.min.js script in the html <script> */
router.get('/timeago.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../node_modules/timeago.js/dist/timeago.min.js'));
});

/* Serve /memechat page */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p9/js5-p9-memechat.html'));
});

/* Serve /memechat/login page */
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p9/js5-p9-login.html'));
});

router.post('/api/login', (req, res) => {
    const { username } = req.body;

    const errMessage = validateUsername(username);
    if (errMessage) return res.status(400).json({error: {message: errMessage}});

    const sessionId = uuidv4();
    sessions[sessionId] = { username };
    onlineUsers.add(username);

    res.cookie('session', sessionId);
    res.json({ username });
});

/* Middleware for authenticating. */
/* If the 'session' cookie is deleted, user will be kicked out of app */ 
const authenticateUser = (req, res, next) => {
    const sessionId = req.headers.cookie?.split('=')[1];
    const userSession = sessions[sessionId];
    if (!userSession) {
        return res.status(401).json({error: {message: 'Invalid session'}});
    }
    res.locals.username = userSession.username;
    next();
};

router.get('/api/logout', authenticateUser, (req, res) => {
    const sessionId = req.headers.cookie?.split('=')[1];
    delete sessions[sessionId];
    onlineUsers.delete(res.locals.username);
    res.clearCookie('session');
    res.end();
}) 

router.get('/api/session', authenticateUser, (req, res) => {
    return res.json({ username: res.locals.username });
});

router.get('/api/memes', authenticateUser, (req, res) => {
    return res.json(memes);
});

router.post('/api/memes', authenticateUser, async (req, res) => {
    const { isStreaming = true, image, captionTop, captionBot } = req.body;
    const username = res.locals.username;

    if (!image || (!captionTop && !captionBot)) {
        return res.status(400).json({error: 
            {message: 'Request is missing image, or a caption'}
        });
    }
    try {
        const meme = await createMeme(username, isStreaming, image, captionTop, captionBot);
        res.json({ meme });
    } catch (err) {
        res.status(500).json({error: {message: err}});
    }
});

export default router;