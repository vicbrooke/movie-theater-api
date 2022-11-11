const request = require("supertest");
const seed = require("../seed");
const app = require("../src/server");

beforeAll(async () => {
  await seed();
});
describe("User route GET requests", () => {
  describe("/ endpoint", () => {
    beforeEach(async () => {
      res = await request(app).get("/users/");
    });
    test("should respond with a 200 status code", () => {
      expect(res.status).toBe(200);
    });
    test("should respond with an array of user objects", () => {
      expect(Array.isArray(res.body)).toBe(true);
      expect(typeof res.body[0]).toBe("object");
    });
    test("user objects should contain username and password properties", () => {
      expect(res.body[0]).toHaveProperty("username");
      expect(res.body[0]).toHaveProperty("password");
    });
  });

  describe("/:id endpoint", () => {
    beforeEach(async () => {
      res = await request(app).get("/users/1");
    });
    test("should respond with 302 found status code with valid id", () => {
      expect(res.status).toBe(302);
    });
    test("should respond with user object", () => {
      expect(typeof res.body).toBe("object");
    });
    test("should respond with 404 user not found for invalid id", async () => {
      const res = await request(app).get("/users/5");
      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("User not found");
    });
  });
});
