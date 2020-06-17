const app = require("../src/index");


describe("Test the root path", () => {
    test("It should response the GET method", async () => {

        const response = await app.server.get('/');
        expect(response.statusCode).toBe(200);
    });
});