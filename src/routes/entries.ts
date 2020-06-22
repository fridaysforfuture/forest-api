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
router.put('/:name', needAuth,
  async (request, response) => {
    if(request.body.links == undefined) {
      request.body.links = [];
    }
    if(request.body.socialLinks == undefined) {
      request.body.socialLinks = {};
    }
    if(request.body.friendlyName == undefined) {
      request.body.friendlyName = request.params.name
    }
    if(typeof(request.user!.username) !== 'string') {
      response.status(401);
      response.send({ error: "Token does not have string username claim" });
      return;
    }
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
    
    const entry = await Entry.findOne( {
        name: request.params.name.toLowerCase(),
      });
    if(entry === null) {
      new Entry({
        name: request.params.name,
        links: request.body.links,
        socialLinks: request.body.socialLinks,
        friendlyName: request.body.friendlyName,
        owner: request.user!.username
      }).save();
      response.send({});
      return;
    }
    if(entry.owner !== request.user!.username) {
      response.status(401);
      response.send({
        error: "Entry already exists and is owned by different user"
      });
      return
    }
    entry.links = request.body.links;
    entry.friendlyName = request.body.friendlyName;
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

  if(request.body.links !== undefined) {
    entry.links = request.body.links;
  }
  if(request.body.friendlyName !== undefined) {
    entry.friendlyName = request.body.friendlyName;
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
