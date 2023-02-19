/* Create router for JS5 Challenge 3 - Meme Gen */
const express = require('express');
const router = express.Router();
const path = require('path');
const Jimp = require('jimp');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p3/js5-p3.html'));
});

/* Server-side caching of last 10 images */
const cache = new Map();
const cacheMemes = (key, value) => {
    cache.set(key, value);
    if (cache.size > 10) {
        cache.delete(cache.keys().next().value);
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

/* Request handler for meme query */
router.get('/api/:caption', async (req, res) => {
    const src = req.query.src || 'https://loremflickr.com/640/480';
    const black = req.query.black || 'false';
    const caption = req.params.caption || '';
    const blur = parseInt(req.query.blur) || 0;

    /* If this query combination is in the cache, send cached buffer */
    const key = src + black + caption + blur;
    if (cache.has(key)) {
        return res.send(cache.get(key));
    }

    /* Generate the meme and send it back */
    try {
        const buffer = await generateMeme(src, black, caption, blur);
        if (!buffer) throw new Error();
        cacheMemes(key, buffer);
        res.set('Content-Type', 'image/jpeg');
        res.send(buffer);
    } catch (err) {
        res.status(400).send('Bad Request - cannot generate meme')
    }
});

module.exports = router;