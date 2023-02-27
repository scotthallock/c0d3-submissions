const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const uploadsDirectory = path.join(__dirname, '../../public/js5-p8/uploads');

/* Create the /uploads folder if it does not exist */
if (!fs.existsSync(uploadsDirectory)) fs.mkdirSync(uploadsDirectory);

/* Set max size of selfie request body - default size is too small */
router.use(bodyParser.json({limit: '10mb'}));

router.use('/uploads', express.static(uploadsDirectory));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p8/js5-p8.html'));
});

/* User submits a selfie */
router.post('/api/uploads', jsonParser, async (req, res) => {
    console.log('/api/uploads ouch ', Date.now());
    if (!req.body.selfie) {
        res.status(400).json({error: {message: 'Request is missing a selfie'}});
    }

    const filename = uuidv4() + '.png';
    const filepath = uploadsDirectory + '/' + filename;

    try {
        await fs.promises.writeFile(filepath, req.body.selfie, 'base64')
    } catch (err) {
        console.error(err);
        res.status(500).json({error: {message: 'Error while saving seflie file to server'}});
    }

    res.status(201).json({ filename });
});

/* Send all selfies in the /uploads folder */
router.get('/api/uploads', async (req, res) => {
    console.log('/api/uploads ouch ', Date.now());
    try {
        const selfies = await fs.promises.readdir(uploadsDirectory);
        res.json({ selfies });
    } catch (err) {
        res.status(500).json({error: {message: 'Error reading /uploads directory'}});
    }
});

/* Delete old selfies from server */
const deleteOldSelfies = async () => {
    try {
        const files = await fs.promises.readdir(uploadsDirectory);
        files.forEach(async (file) => {
            const filepath = uploadsDirectory + '/' + file;
            const stats = await fs.promises.stat(filepath);
            if (Date.now() - stats.mtimeMs > 1000 * 60 * 60 * 24) { // 24 hours
                await fs.promises.unlink(filepath);
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