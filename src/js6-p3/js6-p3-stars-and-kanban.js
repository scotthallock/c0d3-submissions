import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../src/js6-p3/index.html'));
});

/* Serving webpack'ed files in /dist folder */
router.get('/stars', (req, res) => {
  res.sendFile(path.join(__dirname, '../../src/js6-p3/stars/dist/index.html'));
});

router.get('/kanban', (req, res) => {
  res.sendFile(path.join(__dirname, '../../src/js6-p3/kanban/dist/index.html'));
});


router.use('/stars', express.static(path.join(__dirname, '../../src/js6-p3/stars/dist')));

router.use('/kanban', express.static(path.join(__dirname, '../../src/js6-p3/kanban/dist')));

export default router;