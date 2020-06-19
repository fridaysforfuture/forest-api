import express from 'express';
import { entries } from '../dbHandler';
import { needAuth } from '../auth';
import cors from 'cors';

const router = express.Router();

router.use(cors());

router.get('/:name', needAuth,
  async (request, response) => {
    if(request.user!.username !== request.params.name) {
      response.status(401).send({ error: 'You can only get your own user' });
      return;
    }
    const ownEntries = await entries.find(
        { owner: request.params.name },
        { 
          projection: { _id: false },
        });
    response.send({
      ownEntries,
      username: request.params.name
    });
  });

export default router;
