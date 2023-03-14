import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/js6-p3/index.html'));
});

router.get('/stars', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/js6-p3/stars/stars.html'));
});

router.get('/kanban', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/js6-p3/kanban/kanban.html'));
});


router.use('/stars', express.static(path.join(__dirname, '../../public/js6-p3/stars')));

router.use('/kanban', express.static(path.join(__dirname, '../../public/js6-p3/kanban')));

export default router;