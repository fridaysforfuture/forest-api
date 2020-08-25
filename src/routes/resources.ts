import express from 'express';

import cors from 'cors';

const router = express.Router();

router.use(cors());
router.use(express.static('custom_pictures'))

export default router;
