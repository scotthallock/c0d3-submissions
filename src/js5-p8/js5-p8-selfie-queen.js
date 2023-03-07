import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const jsonParser = bodyParser.json();

const uploadsDirectory = path.join(__dirname, '../../public/js5-p8/uploads');
const iconsDirectory = path.join(__dirname, '../../public/js5-p8/icons');

/* Create the /uploads folder if it does not exist */
if (!fs.existsSync(uploadsDirectory)) fs.mkdirSync(uploadsDirectory);

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

/* Delete old selfies from server */
const deleteOldSelfies = async () => {
    try {
        const files = await fs.promises.readdir(uploadsDirectory);
        files.forEach(async (filename) => {
            const filepath = uploadsDirectory + '/' + filename;
            const stats = await fs.promises.stat(filepath);
            if (filename.startsWith('_animal')) { // don't delete the 2 cat selfies
                return;
            }
            if (Date.now() - stats.mtimeMs > 1000 * 60 * 60 * 24) { // 24 hours
                await fs.promises.unlink(filepath); // delete the file
                delete selfies[filename]; // delete the metadata
                console.log(`Deleted ${filename} from /uploads folder at ${new Date()}`);
            }
        });
    } catch (err) {
        console.error(err);
    }
    setTimeout(deleteOldSelfies, 1000 * 60 * 30); // 30 minutes
};
deleteOldSelfies();

/* Set allowable size of POST request body - default size is too small */
router.use(bodyParser.json({limit: '10mb'}));

router.use('/uploads', express.static(uploadsDirectory));
router.use('/icons', express.static(iconsDirectory));

/* External style sheet */
router.get('/js5-p8-styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p8/js5-p8-styles.css'));
});

/* Using timeago.min.js script in the html <script> */
router.get('/timeago.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../node_modules/timeago.js/dist/timeago.min.js'));
});

/* Serve /selfie-queen page */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p8/js5-p8.html'));
});

/* Get all selfies */
router.get('/api/uploads', (req, res) => {
    res.json(selfies);
});

/* Create a new selfie */
router.post('/api/uploads', jsonParser, async (req, res) => {
    if (!req.body.selfie || !req.body.emoji) {
        return res.status(400).json({error: {message: 'Request is missing a selfie or emoji'}});
    }
    const time = Date.now();
    const filename = time + '_' + uuidv4() + '.png';
    const filepath = uploadsDirectory + '/' + filename;

    try {
        await fs.promises.writeFile(filepath, req.body.selfie, 'base64');
        selfies[filename] = {
            timestamp: time,
            emoji: req.body.emoji
        };
        return res.status(201).json(selfies[filename]);
    } catch (err) {
        return res.status(500).json({error: {message: 'Error while saving seflie file to server'}});
    }
});

export default router;