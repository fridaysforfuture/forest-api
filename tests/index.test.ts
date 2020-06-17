const request = require('supertest')
const app = require('../src/index')
/**
 * Currently, we are only looking for valid responses.
 * But hey!!!!!! Test coverage!
 */
describe("Move fast", () => {
    it('and expect nothing.', function (done) {
        request('http://localhost:3001')
            .get('/')
            .set('Accept', 'text/html')
            .expect(404, done);
    });
});
describe("Send correct request", () => {
    it('and create City', function (done) {
        request('http://localhost:3001')
            .put('/entries/berlin')
            .set('Accept', 'application/json')
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
            .expect(200, done);
    });
});

describe("Send incorrect request", () => {
    it('and fail to create City', function (done) {
        request('http://localhost:3001')
            .put('/entries/berlin')
            .send({ links: 'not an array', socialLinks: {}, friendlyName: 'test' })
            .set('Accept', 'application/json')
            .expect(400, done);
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
            .expect(404, done);
    });
    it('and fail to patch exisiting City', function (done) {
        request('http://localhost:3001')
            .patch('/entries/Berlin')
            .send({ links: 'not an array', socialLinks: {}, friendlyName: 'test' })
            .set('Accept', 'application/json')
            .expect(400, done);
    });
    it('and fail to patch with no parameters', function (done) {
        request('http://localhost:3001')
            .patch('/entries/Berlin')
            .send({})
            .set('Accept', 'application/json')
            .expect(400, done);
    });
});

describe("Do body param testing:", () => {
    it('and send no links-array', async function (done) {
        const response: Response = await request('http://localhost:3001')
            .put('/entries/berlin')
            .send({ links: 'not an array', socialLinks: {}, friendlyName: 'test' })
            .set('Accept', 'application/json')

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            'error': 'links is not an array',
        });
        console.log(response.body)
        done()
    });
    it('and send invalid social links', async function (done) {
        const response: Response = await request('http://localhost:3001')
            .put('/entries/berlin')
            .send({ links: [], socialLinks: 'something invalid', friendlyName: 'test' })
            .set('Accept', 'application/json')

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            'error': 'socialLinks is not an object',
        });
        console.log(response.body)
        done()
    });
    it('and send invalid friendlyName', async function (done) {
        const response: Response = await request('http://localhost:3001')
            .put('/entries/berlin')
            .send({ links: [], socialLinks: {}, friendlyName: ['invalid'] })
            .set('Accept', 'application/json')

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            'error': 'friendlyName is not a string',
        });
        console.log(response.body)
        done()
    });
});
