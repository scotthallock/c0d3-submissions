const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { createWorker, PSM, imageType } = require('tesseract.js');
const { v4: uuidv4 } = require('uuid');

/* Where user uploads will be stored */
const uploadsDirectory = path.join(__dirname, '../../public/js5-p7/uploads');

/* Serve static files in /public/js5-p7/uploads */
router.use('/uploads', express.static(uploadsDirectory));

/* Configure multer storage */
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDirectory);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage })

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/js5-p7/js5-p7.html'));
});

/* Store job data */
const jobs = {};

/* Upload an image and save it */
router.post('/api/assets', upload.array('userFiles'), async (req, res) => {
    /* What about rotation pre-processing? */
    console.log('/api/assets ouch ', Date.now);

    const images = req.files;
    const jobId = uuidv4(); // job id

    /* initialize data for this job */
    jobs[jobId] = images.reduce((acc, image) => {
      acc.push({
        filename: image.filename,
        size: image.size,
        status: 'processing', // 'processing' | 'done'
        text: null, // output from Tesseract OCR
        ocr_data: null // output from Tesseract OCR
      })
      return acc;
    }, []);

    process(images, jobId); // begin processing the images
    res.status(202).json({ images, jobId });
});

/* Send back the job data */
router.get('/jobs/:id', (req, res) => {
  console.log('/jobs/:id ouch ', Date.now());
  const jobId = req.params.id;
  res.json(jobs[jobId]);
});

const process = (images, jobId) => {
    /* use tesseract to extract text from each image */
    images.forEach(async (image, i) => {
      try {
        const worker = await createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        await worker.setParameters({
          tessedit_char_whitelist: ' 1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
          tessedit_pageseg_mode: PSM.SPARSE_TEXT, // Find as much text as possible in no particular order.
        });
        const filepath = path.join(uploadsDirectory, image.filename);
        const { data: { text, tsv } } = await worker.recognize(filepath);
        /* the image has been processed, update status and data */
        jobs[jobId][i].status = 'done';
        jobs[jobId][i].text = text;
        jobs[jobId][i].ocr_data = parseTSV(tsv);
        await worker.terminate();
      } catch (err) {
        res.status(400).json({error: {message: 'Error during OCR: ', err}});
      }
    })
};

/* Parse the tab-separated-values output from Teseract */
const parseTSV = (tsv) => {
  const data = tsv
    .split('\n')
    .map(line => line.split('\t'))
    .filter(e => e[0] === '5'); // only care about level==='5' (individual words)
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


module.exports = router;