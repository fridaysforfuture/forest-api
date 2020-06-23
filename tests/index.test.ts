const request = require('supertest');

const PUBLIC_KEY_FILE = 'tests/key.pub';
const PRIVATE_KEY_FILE = 'tests/key.priv';
process.env.KEY_FILE = PUBLIC_KEY_FILE;
const fs = require('fs').promises;
const { promisify } = require('util');
const generateKeyPair = promisify(require('crypto').generateKeyPair);
const jwt = require('jsonwebtoken');
/**
 * Currently, we are only looking for valid responses.
 * But hey!!!!!! Test coverage!
 */

async function generateKeys() {
  const { publicKey, privateKey } = await generateKeyPair('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });
  return Promise.all([
    fs.writeFile(PUBLIC_KEY_FILE, publicKey),
    fs.writeFile(PRIVATE_KEY_FILE, privateKey),
  ]).then(() => ({ publicKey, privateKey }));
}

async function getKeys() {
  /**
   * We try to reuse old keys, because creating these keys is relatively
   * expensive
   */
  return await Promise.all([
    fs.readFile(PRIVATE_KEY_FILE),
    fs.readFile(PUBLIC_KEY_FILE),
  ])
    .then(([privateKey, publicKey]) => ({ privateKey, publicKey }))
    .catch(generateKeys);
}

let authHeader: any = null;
let authHeaderNoUsername: any = null;
let authHeaderDifferentUser: any = null;
beforeAll(async () => {
  /**
   * We generate our own Key-Pair to create our own jwt
   */
  const keys = await getKeys();
  require('../src/index');
  const token = await jwt.sign(
    {
      username: 'test_user',
    },
    keys.privateKey,
    { algorithm: 'RS256' },
  );
  const tokenNoUsername = await jwt.sign({}, keys.privateKey, {
    algorithm: 'RS256',
  });
  const tokenDifferentUser = await jwt.sign(
    {
      username: 'other_user',
    },
    keys.privateKey,
    { algorithm: 'RS256' },
  );

  authHeader = {
    Authorization: `Bearer ${token}`,
  };
  authHeaderNoUsername = {
    Authorization: `Bearer ${tokenNoUsername}`,
  };
  authHeaderDifferentUser = {
    Authorization: `Bearer ${tokenDifferentUser}`,
  };

  /**
   * Berlin muss existieren
   */

  await request('http://localhost:3001')
    .put('/entries/berlin')
    .set(authHeader)
    .set('Accept', 'application/json');
});
describe('Move fast', () => {
  it('and expect nothing.', function (done) {
    request('http://localhost:3001')
      .get('/')
      .set('Accept', 'text/html')
      .expect(404, done);
  });
});
describe('Send correct request', () => {
  it('and create new City', function (done) {
    request('http://localhost:3001')
      .put('/entries/berlin2')
      .set('Accept', 'application/json')
      .set(authHeaderDifferentUser)
      .expect(200, done);
  });
  it('and create exisiting City', function (done) {
    request('http://localhost:3001')
      .put('/entries/berlin')
      .set('Accept', 'application/json')
      .set(authHeader)
      .expect(200, done);
  });
  it('and get City', function (done) {
    request('http://localhost:3001')
      .get('/entries/berlin')
      .set('Accept', 'application/json')
      .expect(200, done);
  });
  it('and patch City', function (done) {
    request('http://localhost:3001')
      .patch('/entries/berlin')
      .send({ links: [], socialLinks: {}, friendlyName: 'test' })
      .set('Accept', 'application/json')
      .set(authHeader)
      .expect(200, done);
  });
  it('and patch with no parameters', function (done) {
    request('http://localhost:3001')
      .patch('/entries/Berlin')
      .send({})
      .set('Accept', 'application/json')
      .set(authHeader)
      .expect(200, done);
  });
});

describe('Send incorrect request', () => {
  it('and fail to create City because of malformed parameters', function (done) {
    request('http://localhost:3001')
      .put('/entries/berlin')
      .send({ links: 'not an array', socialLinks: {}, friendlyName: 'test' })
      .set('Accept', 'application/json')
      .set(authHeader)
      .expect(400, done);
  });
  it('and fail to create City because of missing auth', function (done) {
    request('http://localhost:3001')
      .put('/entries/berlin')
      .send({ links: [], socialLinks: {}, friendlyName: 'test' })
      .set('Accept', 'application/json')
      .expect(401, done);
  });
  it('and fail to create City because of missing claim', function (done) {
    request('http://localhost:3001')
      .put('/entries/berlin')
      .send({ links: [], socialLinks: {}, friendlyName: 'test' })
      .set('Accept', 'application/json')
      .set(authHeaderNoUsername)
      .expect(401, done);
  });
  it('and fail to create City becaue of wrong user', function (done) {
    request('http://localhost:3001')
      .put('/entries/berlin')
      .send({ links: [], socialLinks: {}, friendlyName: 'test' })
      .set('Accept', 'application/json')
      .set(authHeaderDifferentUser)
      .expect(401, done);
  });
  it('and fail to get City, get 404 not found', function (done) {
    request('http://localhost:3001')
      .get('/entries/Bielefeld')
      .set('Accept', 'application/json')
      .expect(404, done);
  });
  it('and fail to patch non-exisiting City', function (done) {
    request('http://localhost:3001')
      .patch('/entries/Bielefeld')
      .send({ links: [], socialLinks: {}, friendlyName: 'test' })
      .set('Accept', 'application/json')
      .set(authHeader)
      .expect(404, done);
  });
  it('and fail to patch exisiting City with wrong parameters', function (done) {
    request('http://localhost:3001')
      .patch('/entries/Berlin')
      .send({ links: 'not an array', socialLinks: {}, friendlyName: 'test' })
      .set('Accept', 'application/json')
      .set(authHeader)
      .expect(400, done);
  });
  it('and fail to patch exisiting City with missing auth', function (done) {
    request('http://localhost:3001')
      .patch('/entries/Berlin')
      .send({ links: [], socialLinks: {}, friendlyName: 'test' })
      .set('Accept', 'application/json')
      .expect(401, done);
  });
  it('and fail to patch existing City from different user', function (done) {
    request('http://localhost:3001')
      .patch('/entries/Berlin')
      .send({})
      .set('Accept', 'application/json')
      .set(authHeaderDifferentUser)
      .expect(401, done);
  });
});

describe('Do body param testing:', () => {
  it('and send no links-array', async function (done) {
    const response = await request('http://localhost:3001')
      .put('/entries/berlin')
      .send({ links: 'not an array', socialLinks: {}, friendlyName: 'test' })
      .set(authHeader)
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'links is not an array',
    });
    console.log(response.body);
    done();
  });
  it('and send invalid social links', async function (done) {
    const response = await request('http://localhost:3001')
      .put('/entries/berlin')
      .send({
        links: [],
        socialLinks: 'something invalid',
        friendlyName: 'test',
      })
      .set('Accept', 'application/json')
      .set(authHeader);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'socialLinks is not an object',
    });
    console.log(response.body);
    done();
  });
  it('and send invalid friendlyName', async function (done) {
    const response = await request('http://localhost:3001')
      .put('/entries/berlin')
      .send({ links: [], socialLinks: {}, friendlyName: ['invalid'] })
      .set('Accept', 'application/json')
      .set(authHeader);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'friendlyName is not a string',
    });
    console.log(response.body);
    done();
  });
});

describe('Testing /user endpoint', () => {
  it('Getting all entries', async function (done) {
    const response = await request('http://localhost:3001')
      .get('/user/test_user')
      .set(authHeader)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ownEntries: [
        {
          links: [],
          name: 'berlin',
        },
      ],
    });
    done();
  });
  it('Fail to get entries from somebody else', async function (done) {
    request('http://localhost:3001')
      .get('/user/admin')
      .set(authHeader)
      .set('Accept', 'application/json')
      .expect(401, done);
  });
});
