import Entry from '../Entry';
import express from 'express';

const router = express.Router();

router.get('/count', async (_request, response) => {
  const count = await Entry.count({});
  response.send({ count });
});

export default router;
