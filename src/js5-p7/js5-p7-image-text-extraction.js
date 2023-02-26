const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { createWorker, PSM } = require('tesseract.js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

/* Where user uploads and examples will be stored */
const uploadsDirectory = path.join(__dirname, '../../public/js5-p7/uploads');
const examplesDirectory = path.join(__dirname, '../../public/js5-p7/examples');

/* Serve static files */
router.use('/uploads', express.static(uploadsDirectory));
router.use('/examples', express.static(examplesDirectory));

/* Configure multer storage */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // keep original filename
    }
});
const upload = multer({ storage: storage });

/* Serve /image-text-extraction page */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p7/js5-p7.html'));
});

/* Store job data */
const jobs = {};

/* User uploads images to process */
router.post('/api/assets', upload.array('userFiles'), async (req, res) => {
    const images = req.files;
    const jobId = uuidv4();

    processJob(jobId, images, uploadsDirectory); // begin processing the images
    res.status(202).json({ images, jobId }); // tell the client the job is accepted
});

/* Choose 3 random files from the 'examples' folder to process */
router.get('/api/random', async (req, res) => {
    const files = await fs.promises.readdir(path.join(__dirname, '../../public/js5-p7/examples'));
  
    /* Fisher-Yates shuffle */
    let currIndex = files.length;
    while (currIndex !== 0) {
        const randIndex = Math.floor(Math.random() * currIndex);
        currIndex -= 1;
        [files[currIndex], files[randIndex]] = [files[randIndex], files[currIndex]];
    }
    const randomFiles = files.slice(0, 3);
    const images = randomFiles.map(e => ( { filename: e } ));
    const jobId = uuidv4();

    processJob(jobId, images, examplesDirectory); // begin processing the images
    res.status(202).json({ images, jobId }); // tell the client the job is accepted
});

/* Send back the job data */
router.get('/jobs/:id', (req, res) => {
    console.log('/jobs/:id ouch ', Date.now());
    const jobId = req.params.id;
    res.json(jobs[jobId]);
});

/* Initialize the jobs[jobId] array with data */
const initializeJobData = (jobId, images) => {
  jobs[jobId] = images.reduce((acc, image) => {
    acc.push({
      filename: image.filename,
      status: 'processing', // 'processing' | 'done'
      text: null, // output from Tesseract OCR
      ocr_data: null // output from Tesseract OCR
    })
    return acc;
  }, []);
};

/* Use Tesseract to perform Optical Character Recognition on each image in the job */
const processJob = (jobId, images, dir) => {
    initializeJobData(jobId, images); 

    /* Use tesseract to extract text from each image */
    images.forEach(async (image, i) => {
        try {
            const worker = await createWorker();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');

            const filepath = path.join(dir, image.filename);
            const { data: { text, tsv } } = await worker.recognize(filepath);

            /* the image has been processed, update status and data */
            jobs[jobId][i].status = 'done';
            jobs[jobId][i].text = text;
            jobs[jobId][i].ocr_data = parseTSV(tsv);
            await worker.terminate();
        } catch (err) {
            jobs[jobId][i].status = 'done';
            jobs[jobId][i].error = {message: {err}};
            res.status(400).json({error: {message: 'Error during OCR: ', err}});
        }
    })
};

/* Transform the tab-separated-values output from Teseract into an object */
const parseTSV = (tsv) => {
    const data = tsv
        .split('\n')
        .map(line => line.split('\t'))
        .filter(e => e[0] === '5'); // only care about level==='5' (words)
    return data.reduce((acc, e) => {
        acc.push({
            level: e[0],
            page_num: e[1],
            block_num: e[2],
            par_num: e[3],
            line_num: e[4],
            word_num: e[5],
            left: e[6],
            top: e[7],
            width: e[8],
            height: e[9],
            conf: e[10],
            text: e[11]
        });
        return acc;
    }, []);
};

/* Delete old files from /uploads folder */
const deleteOldFiles = async () => {
  const files = await fs.promises.readdir(uploadsDirectory);
  files.forEach(async (file) => {
      try {
          const filepath = uploadsDirectory + '/' + file;
          const stats = await fs.promises.stat(filepath);
          if (Date.now() - stats.mtimeMs > 1000 * 60 * 60 * 12) { // 12 hours
              await fs.promises.unlink(filepath);
              console.log(`Deleted ${file} from /uploads folder at ${new Date()}`);
          }
      } catch (err) {
          console.error(err);
      }
  });
  /* Recursively call this function every 10 minutes */
  setTimeout(deleteOldFiles, 1000 * 60 * 10);
};
deleteOldFiles();

module.exports = router;