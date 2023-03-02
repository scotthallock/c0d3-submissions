const express = require('express');
const router = express.Router();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Jimp = require('jimp');
const { createCanvas, loadImage } = require('canvas');
const fsp = require('fs').promises;

const uploadsDirectory = path.join(__dirname, '../../public/js5-p9/uploads');

const sessions = {};
const memes = {};

const createMeme = async (username, image, captionTop, captionBot) => {
    const filename = username + '.png'
    const filepath = uploadsDirectory + '/' + filename;

    return new Promise(async (resolve, reject) => {
        await fsp.writeFile(filepath, image, {encoding: 'base64url'});

        // load image to draw onto canvas
        const loadedImage = await loadImage(filepath);
        const canvas = createCanvas(640, 480);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(loadedImage, 0, 0, 640, 480);

        // set up ctx
        ctx.font = 'bold 50px sans-serif';
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
    });
};

router.use(express.json({limit: '10mb'}));

router.use('/uploads', express.static(uploadsDirectory));

/* Serve /memechat page */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p9/js5-p9.html'));
});

router.post('/login', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(401).json({error: {message: 'Please include username in request'}});
    }
    if (Object.values(sessions).some(e => e.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({error: {message: 'Sorry, that username is currently taken'}});
    }

    const sessionId = uuidv4();
    sessions[sessionId] = { username };
    res.cookie('session', sessionId);
    res.json({ username });
});

router.get('/logout', (req, res) => {
    const sessionId = req.headers.cookie?.split('=')[1];
    delete sessions[sessionId];
    res.clearCookie('session');
    res.end();
}) 

router.get('/api/session', (req, res) => {
    const sessionId = req.headers.cookie?.split('=')[1];
    const userSession = sessions[sessionId];
    if (!userSession) {
        return res.status(401).json({error: {message: 'Invalid session'}});
    }
    return res.json({ username: userSession.username });
});

router.get('/api/memes', (req, res) => {
    res.json(memes);
});

router.post('/api/memes', async (req, res) => {
    console.log('ouch /api/memes', Date.now());
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




module.exports = router;