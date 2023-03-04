const express = require('express');
const router = express.Router();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createCanvas, loadImage } = require('canvas');
const fsp = require('fs').promises;
const defaultMemes = require('./defaultMemes');

const uploadsDirectory = path.join(__dirname, '../../public/js5-p9/uploads');

const sessions = {};
const memes = defaultMemes;

const createMeme = async (username, image, captionTop, captionBot) => {
    const filename = username + '.png'
    const filepath = uploadsDirectory + '/' + filename;

    return new Promise(async (resolve, reject) => {
        try {
            await fsp.writeFile(filepath, image, {encoding: 'base64'});

            // load image to draw onto canvas
            const loadedImage = await loadImage(filepath);
            const canvas = createCanvas(640, 480);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(loadedImage, 0, 0, 640, 480);
    
            // set up ctx
            ctx.font = 'bold 60px Impact Arial sans-serif';
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
            resolve(meme);

        } catch (err) {
            reject(err);
        }
    });
};

router.use(express.json({limit: '10mb'}));

router.use('/uploads', express.static(uploadsDirectory));

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
    if (!username) {
        return res.status(401).json({error: {message: 'Please include username in request'}});
    }
    if (Object.values(sessions).some(e => e.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({error: {message: 'That name is currently taken'}});
    }

    const sessionId = uuidv4();
    sessions[sessionId] = { username };
    res.cookie('session', sessionId);
    res.json({ username });
});

router.get('/api/logout', (req, res) => {
    const sessionId = req.headers.cookie?.split('=')[1];
    delete sessions[sessionId];
    res.clearCookie('session');
    res.end();
}) 

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

router.get('/api/session', authenticateUser, (req, res) => {
    return res.json({ username: res.locals.username });
});

router.get('/api/memes', authenticateUser, (req, res) => {
    return res.json(memes);
});

router.post('/api/memes', authenticateUser, async (req, res) => {
    const { username, image, captionTop, captionBot } = req.body;

    if (!username || !image || (!captionTop && !captionBot)) {
        return res.status(400).json({error: 
            {message: 'Request is missing username, image, or a caption'}
        });
    }
    try {
        const meme = await createMeme(username, image, captionTop, captionBot);
        res.json({ meme });
    } catch (err) {
        res.status(500).json({error: {message: err}});
    }
});

console.log('HERE!')

module.exports = router;