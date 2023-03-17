import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

/* Serving webpack'ed file in /dist folder */
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../src/js6-p4/dist/index.html'));
});

router.use('/', express.static(path.join(__dirname, '../../src/js6-p4/dist/')));

export default router;