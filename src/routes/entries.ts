import express from 'express';
import BodyParser from 'body-parser';
import { entries } from '../dbHandler';
const router = express.Router();

router.put('/:name', (request, response) => {
  console.log("New entry: %s", request.params.name);
  entries.updateOne(
    {
      name: request.params.name.toLowerCase(),
    },
    {
      $setOnInsert: { links: [] },
    },
    { upsert: true });

  // Always send valid JSON!
  response.send({});
});

export default router;
