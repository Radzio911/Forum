import express from "express";
import mongoose from "mongoose";
import { User } from "./models/user.js";
import { Topic } from "./models/topic.js";
import { Comment } from "./models/comment.js";
import md5 from "md5";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import Sentiment from "sentiment";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const TOKEN = process.env.TOKEN;

// auth
app.use((req, res, next) => {
  const token = req.cookies.TOKEN;
  jwt.verify(token, TOKEN, (err, decoded) => {
    if (err) req.user = null;
    else req.user = decoded.id;
  });
  next();
});

mongoose.connect(process.env.MONGO);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (await User.findOne({ username })) {
    res.status(400).json({ error: true });
  } else {
    const user = await User.create({ username, password: md5(password) });
    res.json(user);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({
    username: username,
    password: md5(password),
  });
  if (user) {
    const token = jwt.sign({ id: user._id }, TOKEN);
    res.cookie("TOKEN", token);
    res.status(200).json({ login: true });
  } else {
    res.status(400).json({ login: false });
  }
});

app.post("/topic", async (req, res) => {
  const { title, description } = req.body;
  const now = new Date();
  const topic = await Topic.create({
    title,
    description,
    createDate: now,
    user: req.user,
  });
  res.json(topic);
});

const sentiment = new Sentiment();

app.post("/comment", async (req, res) => {
  const { comment, topicId } = req.body;
  const topic = await Topic.findById(topicId);
  const now = new Date();
  const result = sentiment.analyze(comment);
  if (topic && comment && comment.length > 5 && result.score >= 0) {
    const com = await Comment.create({
      comment,
      topic,
      createDate: now,
      user: req.user,
    });
    res.json(com);
  } else {
    res.status(400).json({ error: true });
  }
});

app.get("/topic/:id", async (req, res) => {
  const { id } = req.params;
  const topic = await Topic.findById(id);
  const comments = await Comment.find({ topic: topic });
  if (topic) {
    res.json({ ...topic.toJSON(), comments });
  } else res.status(404).json({ error: true });
});

app.listen(8000);
