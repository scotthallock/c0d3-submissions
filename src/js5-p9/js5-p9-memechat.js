const express = require('express');
const router = express.Router();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Jimp = require('jimp');

router.use(express.json());

const sessions = {};
const memes = {
    'user1': {
        filename: 'user1.png',
        created: Date.now()
    }
};

/* Generate meme and return Promise for buffer */
const generateMeme = async (src, black, caption, blur) => {
    try {
        /* load the image */
        const loadedImage = await Jimp.read(src);
        /* blur the image */
        if (blur > 0) loadedImage.blur(blur);
        /* load the font */
        const font = black === 'true' ? 
            await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK) : 
            await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        /* put the caption on the image */
        loadedImage.print(
            font,
            0, // x
            30, // y
            {
            text: caption,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_TOP
            },
            loadedImage.bitmap.width // max width before text wrap
        );
        /* return a Promise for the binary buffer */
        return loadedImage.getBufferAsync(Jimp.MIME_JPEG);
    } catch (err) {
        console.error(err)
    }
};





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

/* create meme */
router.post('/api/memes', (req, res) => {

});


/* get all memes */
router.get('/api/memes', (req, res) => {

});



module.exports = router;