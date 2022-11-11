const request = require("supertest");
const { User } = require("../models");
const seed = require("../seed");
const app = require("../src/server");
const express = require("express");
app.use(express.json());

beforeAll(async () => {
  await seed();
});
describe("User route", () => {
  describe("GET requests", () => {
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
    describe("/:id/shows endpoint", () => {
      beforeEach(async () => {
        const show = await request(app)
          .put("/users/1/shows/1")
          .send({ rating: 3, status: "watched" });
        res = await request(app).get("/users/1/shows");
      });
      test("should respond with 201 status with valid user and show ids", () => {
        expect(res.statusCode).toBe(200);
      });
      test("should respond with updated show object", () => {
        expect(res.body[0].rating).toBe(3);
        expect(res.body[0].status).toBe("watched");
      });
      test("should respond with 404 if invalid user or show ids", async () => {
        res = await request(app).get("/users/3/shows");
        expect(res.statusCode).toBe(404);
      });
    });
  });
  describe("PUT requests", () => {
    describe("/:id.shows/:showId endpoint", () => {
      test("should return 201 created status and for valid user and show ids", async () => {
        res = await request(app)
          .put("/users/1/shows/1")
          .send({ rating: 10, status: "watched" });
        expect(res.statusCode).toBe(201);
      });
      test("should return a 404 status if given invalid user id", async () => {
        res = await request(app)
          .put("/users/5/shows/1")
          .send({ rating: 10, status: "watched" });
        expect(res.statusCode).toBe(404);
      });
      test("should return a 404 status if given invalid show id", async () => {
        res = await request(app)
          .put("/users/1/shows/99")
          .send({ rating: 10, status: "watched" });
        expect(res.statusCode).toBe(404);
      });
      test("should return a 400 status and error message if given invalid rating value", async () => {
        res = await request(app)
          .put("/users/1/shows/1")
          .send({ rating: "b", status: "watched" });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].msg).toBe("Rating must be a number");
      });
      test("should return 400 status and error message if given too short status value", async () => {
        res = await request(app)
          .put("/users/1/shows/1")
          .send({ rating: 10, status: "hi" });
        expect(res.body.errors[0].msg).toBe(
          "Status must be between 5 and 25 characters"
        );
      });
      test("should return 400 status and error message if given invalid status value", async () => {
        res = await request(app)
          .put("/users/1/shows/1")
          .send({ rating: 10, status: "123445" });
        expect(res.body.errors[0].msg).toBe("Status can only contain letters");
      });
      test("should add a show to a user if ids are valid and status is set to watched", async () => {
        res = await request(app)
          .put("/users/1/shows/1")
          .send({ rating: 10, status: "watched" });
        const user1 = await User.findByPk(1);
        const user1Shows = await user1.getShows();
        expect(user1Shows[0].toJSON().id).toBe(1);
        expect(user1Shows[0].toJSON().status).toBe("watched");
      });
    });
  });
});
