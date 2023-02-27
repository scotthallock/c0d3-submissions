const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const uploadsDirectory = path.join(__dirname, '../../public/js5-p8/uploads');
const iconsDirectory = path.join(__dirname, '../../public/js5-p8/icons');

/* Create the /uploads folder if it does not exist */
if (!fs.existsSync(uploadsDirectory)) fs.mkdirSync(uploadsDirectory);

/* Set max size of selfie request body - default size is too small */
router.use(bodyParser.json({limit: '10mb'}));

router.use('/uploads', express.static(uploadsDirectory));
router.use('/icons', express.static(iconsDirectory));

/* Using timeago.min.js script in the html <script> */
router.get('/timeago.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../node_modules/timeago.js/dist/timeago.min.js'));
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p8/js5-p8.html'));
});

/* Initialize selfie metadata object */
const selfies = {
    '_animal-selfie-1.png': {
        timestamp: Date.now() - (1000 * 60 * 60),
        emoji: '😎'
    },
    '_animal-selfie-2.png': {
        timestamp: Date.now(),
        emoji: '😈'
    }
};

/* User submits a selfie */
router.post('/api/uploads', jsonParser, async (req, res) => {
    console.log('/api/uploads ouch ', Date.now());
    console.log('the emoji is ', req.body.emoji);
    if (!req.body.selfie || !req.body.emoji) {
        res.status(400).json({error: {message: 'Request is missing a selfie or emoji'}});
    }
    const time = Date.now();
    const filename = time + '_' + uuidv4() + '.png';
    const filepath = uploadsDirectory + '/' + filename;

    try {
        await fs.promises.writeFile(filepath, req.body.selfie, 'base64')
        selfies[filename] = {
            timestamp: time,
            emoji: req.body.emoji
        };
        res.status(201).json(selfies[filename]);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: {message: 'Error while saving seflie file to server'}});
    }
});

/* Send all selfies in the /uploads folder */
router.get('/api/uploads', (req, res) => {
    console.log('/api/uploads ouch ', Date.now());
    res.json(selfies);
});

/* Delete old selfies from server */
const deleteOldSelfies = async () => {
    try {
        const files = await fs.promises.readdir(uploadsDirectory);
        files.forEach(async (filename) => {
            const filepath = uploadsDirectory + '/' + filename;
            const stats = await fs.promises.stat(filepath);
            if (filename.startsWith('_animal')) { // don't delete the example animal selfies
                return;
            }
            if (Date.now() - stats.mtimeMs > 1000 * 60 * 60 * 24) { // 24 hours
                await fs.promises.unlink(filepath); // delete the file
                delete selfies[filename]; // delete the metadata
                console.log(`Deleted ${file} from /uploads folder at ${new Date()}`);
            }
        });
    } catch (err) {
        console.error(err);
    }
    /* Recursively call this function every 30 minutes */
    setTimeout(deleteOldSelfies, 1000 * 60 * 30);
};
deleteOldSelfies();

module.exports = router;