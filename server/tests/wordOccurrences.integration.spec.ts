import express from "express";
import request from "supertest";

describe("POST /count-occurrences", () => {
  const app = express();
  app.use(express.json());

  app.post("/count-occurrences", (req, res) => {
    const text = req.body?.text;
    const word = req.body?.word;

    if (typeof text !== "string" || typeof word !== "string") {
      return res.status(400).json({ message: "text and word must be strings" });
    }

    if (!word.trim()) {
      return res.status(400).json({ message: "word cannot be empty" });
    }

    const normalizedWord = word.toLowerCase();
    const count = text
      .toLowerCase()
      .split(/\W+/)
      .filter((item) => item === normalizedWord).length;

    return res.json({ count });
  });

  test("returns the number of occurrences for a word", async () => {
    const response = await request(app).post("/count-occurrences").send({
      text: "chat chien chat oiseau Chat",
      word: "chat",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ count: 3 });
  });
});
