const request = require("supertest");
const { User, Show } = require("../models");
const seed = require("../seed");
const app = require("../src/server");
const express = require("express");
app.use(express.json());

beforeAll(async () => {
  await seed();
});

describe("Show route", () => {
  describe("GET requests", () => {
    describe("/ endpoint", () => {
      beforeEach(async () => {
        res = await request(app).get("/shows/");
      });
      test("should respond with 302 found status message", () => {
        expect(res.statusCode).toBe(302);
      });
      test("should respond with an array of show objects", () => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(typeof res.body[0]).toBe("object");
      });
      test("show objects should contain title, genre, rating and status properties", () => {
        expect(res.body[0]).toHaveProperty("title");
        expect(res.body[0]).toHaveProperty("genre");
        expect(res.body[0]).toHaveProperty("rating");
        expect(res.body[0]).toHaveProperty("status");
      });
    });
    describe("/:id endpoint", () => {
      beforeEach(async () => {
        res = await request(app).get("/shows/1");
      });
      test("should respond with 302 found status code with valid id", () => {
        expect(res.status).toBe(302);
      });
      test("should respond with show object", () => {
        expect(typeof res.body).toBe("object");
      });
      test("should respond with 404 show not found for invalid id", async () => {
        const res = await request(app).get("/shows/20");
        expect(res.statusCode).toBe(404);
        expect(res.text).toBe("Show not found");
      });
    });
    describe("/genres/:genre endpoint", () => {
      beforeEach(async () => {
        res = await request(app).get("/shows/genres/Comedy");
      });
      test("should return 302 status when given valid genre", () => {
        expect(res.statusCode).toBe(302);
      });
      test("should return an array of show objects", () => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(typeof res.body[0]).toBe("object");
      });
      test("should return 404 and no shows found message when given invalid genre", async () => {
        const res = await request(app).get("/shows/genres/Action");
        expect(res.statusCode).toBe(404);
        expect(res.text).toBe("No shows found for genre: Action");
      });
    });
  });

  describe("PUT requests", () => {
    describe("/shows/:id/updates endpoint", () => {
      test("should respond with 200 status code when given valid id", async () => {
        const res = await request(app).put("/shows/1/updates");
        expect(res.statusCode).toBe(200);
      });
      test("should respond with 404 show not found message if given invalid show id", async () => {
        const res = await request(app).put("/shows/99/updates");
        expect(res.statusCode).toBe(404);
      });
    });
  });

  describe("DELETE requests", () => {
    test("should respond with 204 status", async () => {
      const res = await request(app).delete("/shows/1/delete");
      expect(res.statusCode).toBe(204);
    });
    test("should respond with 404 show not found message if given an invalid show id", async () => {
      const res = await request(app).delete("/shows/99/delete");
      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("Show not found");
    });
  });
});
