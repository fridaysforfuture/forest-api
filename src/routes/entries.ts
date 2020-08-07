import express from 'express';
import BodyParser from 'body-parser';
import Entry from '../Entry';
import { needAuth } from '../auth';
import cors from 'cors';

const router = express.Router();

router.use(cors());
function testParams(body: any) {
   if(body.links !== undefined && !Array.isArray(body.links)) {
    throw 'links is not an array';
  }
  if(body.socialLinks !== undefined && typeof(body.socialLinks) !== 'object') {
    throw 'socialLinks is not an object';
  }
  if(body.friendlyName !== undefined && typeof(body.friendlyName) !== 'string') {
    throw 'friendlyName is not a string';
  }
}

router.use(BodyParser.json());

router.delete('/:name', needAuth, async (request, response) => {
  let entry = await Entry.findOne({
    name: request.params.name
  });
  if (entry === null) {
    response.status(404);
    response.send({ error: 'Entry does not exist' });
    return;
  }
  if (entry.owner !== request.user!.sub) {
    response.status(401);
    response.send({ error: 'Can only delete owned entries' });
    return;
  }
  await entry.remove();
  response.status(200);
  response.send({});
});

router.put('/:name', needAuth, async (request, response) => {
  if (request.body.links == undefined) {
    request.body.links = [];
  }
  if (request.body.socialLinks == undefined) {
    request.body.socialLinks = {};
  }
  if (request.body.friendlyName == undefined) {
    request.body.friendlyName = request.params.name;
  }
  if (request.body.sharedTo == undefined) {
    request.body.sharedTo = [];
  }
  if (typeof request.user!.sub !== 'string') {
    response.status(401);
    response.send({ error: 'Token does not have string sub claim' });
    return;
  }
  try {
    testParams(request.body);
  } catch (error) {
    response.status(400);
    response.send({ error });
    return;
  }
  // We only want lower case entries
  request.params.name = request.params.name.toLowerCase();

  const entry = await Entry.findOne({
    name: request.params.name,
  });
  if (entry === null) {
    new Entry({
      name: request.params.name,
      links: request.body.links,
      socialLinks: request.body.socialLinks,
      friendlyName: request.body.friendlyName,
      owner: request.user!.sub,
      sharedTo: request.body.sharedTo,
    }).save();
    response.send({});
    return;
  }
  if (entry.owner !== request.user!.sub &&
      !entry.sharedTo.includes(request.user!.sub)) {
    response.status(401);
    response.send({
      error: 'Entry already exists and is owned by different user',
    });
    return;
  }
  entry.links = request.body.links;
  entry.friendlyName = request.body.friendlyName;
  entry.socialLinks = request.body.socialLinks;

  // Only the owner is allowed to change the shared user.
  if (entry.owner === request.user!.sub) {
    entry.sharedTo = request.body.sharedTo;
  }

  entry.save();
  response.send({});
});

router.patch('/:name', needAuth,
  async (request, response) => {
  try
  {
    testParams(request.body);
  }
  catch (error)
  {
    response.status(400);
    response.send({ error });
    return;
  }

  const entry = await Entry.findOne({
    name: request.params.name.toLowerCase()
  });

  if(entry === null) {
    response.status(404);
    response.send({
        error: "Entry not found",
    });
    return;
  }
  if (entry.owner !== request.user!.sub &&
      !entry.sharedTo.includes(request.user!.sub)) {
    response.status(401);
    response.send({
        error: "Entry is owned by different user",
    });
    return;
  }

  if(request.body.links !== undefined) {
    entry.links = request.body.links;
  }
  if(request.body.friendlyName !== undefined) {
    entry.friendlyName = request.body.friendlyName;
  }
  if(request.body.sharedTo !== undefined && entry.owner === request.user!.sub) {
    entry.sharedTo = request.body.sharedTo;
  }
  entry.save();
  response.send({});
});

router.get('/:name', async (request, response) => {
  const entry = await Entry.findOne(
    { name: request.params.name.toLowerCase() },
    { _id: false });
  if(entry === null) {
    response.status(404);
    response.send({
      error: 'Entry does not exist'
    });
    return;
  }
  response.send(entry);
});
export default router;
