import express from 'express';
import BodyParser from 'body-parser';
import Entry from '../Entry';
import { needAuth } from '../auth';
import cors from 'cors';
import multer from 'multer';

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
const upload = multer({dest: "custom_pictures"})

router.delete('/:name', needAuth, async (request, response) => {
  let entry = await Entry.findOne({
    name: request.params.name.toLowerCase()
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

let fileHandler: any = 
  (request: any, _: any, next: any) => {
  if (request.headers["content-type"]?.startsWith("multipart/form-data")) {
    for (const key of Object.keys(request.body)) {
      request.body[key] = JSON.parse(request.body[key]);
    }
  }
  next();
};

router.put(
  '/:name',
  needAuth,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "background", maxCount: 1 }]),
  fileHandler,
  async (request, response) => {
  let logo = (request.files as any)?.['logo']?.[0].filename;
  let background = (request.files as any)?.['background']?.[0].filename;
  console.log(request.files);
  console.log(logo);
  console.log(background);

  if (request.body.links == undefined) {
    request.body.links = [];
  }
  if (request.body.socialLinks == undefined) {
    request.body.socialLinks = {};
  }
  if (request.body.friendlyName == undefined) {
    request.body.friendlyName = request.params.name;
    console.log("This is a test");
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
      logo: logo,
      background: background,
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
  if (logo) {
    entry.logo = logo;
  }
  if (background) {
    entry.background = background;
  }

  // Only the owner is allowed to change the shared user.
  if (entry.owner === request.user!.sub) {
    entry.sharedTo = request.body.sharedTo;
  }
  console.log(entry);
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
