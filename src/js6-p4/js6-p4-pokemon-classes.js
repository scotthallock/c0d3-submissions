import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();


router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/js6-p4/index.html'));
});

router.use('/', express.static(path.join(__dirname, '../../public/js6-p4')));

export default router;