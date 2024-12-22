import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import { contentModel, LinkModel, userModel } from "./db";
import { JWT_SECRET, PORT } from "./config";
import { authMiddleware } from "./middleware";
import { generateHash } from "./utils";
import cors from "cors";
import { error } from "console";
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    PORT: string;
    MONGO_URL: string;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const user = await userModel.create({
      username,
      password,
    });

    res.json({
      message: "You have signed up",
    });
  } catch (e) {
    res.status(403).json({
      message: "Username already exists",
      error: e,
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await userModel.findOne({ username, password });

  if (!user) {
    res.status(403).json({
      message: "Wrong username or passwrod",
    });
    return;
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET);

  res.json({
    token,
  });
});

app.post("/api/v1/content", authMiddleware, async (req, res) => {
  const title = req.body.title;
  const link = req.body.link;
  const type = req.body.type;

  try {
    await contentModel.create({
      type,
      title,
      link,
      userId: req.id,
      tags: [],
    });

    res.json({
      message: "Content created",
    });
  } catch (e) {
    res.status(500).json({
      message: "an error occured while creating the content",
    });
  }
});

app.get("/api/v1/content", authMiddleware, async (req, res) => {
  const userId = req.id;

  try {
    const contents = await contentModel.find({
      userId: userId,
    });
    const user = await userModel.findOne({
      _id: userId,
    });

    res.json({
      username: user?.username,
      contents,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "an error occured" });
  }
});

app.delete("/api/v1/content", authMiddleware, async (req, res) => {
  const contentId = req.body.id;

  try {
    await contentModel.deleteOne({
      _id: contentId,

      userId: req.id,
    });

    res.json({
      message: "Content deleted",
    });
  } catch (e) {
    res.status(403).json({
      message: "content not forund",
    });
  }
});

app.post("/api/v1/brain/share", authMiddleware, async (req, res) => {
  const { share } = req.body;
  if (share) {
    try {
      const link = await LinkModel.create({
        userId: req.id,
        hash: generateHash(10),
      });

      res.json({
        link: link.hash,
      });
    } catch (e) {
      const link = await LinkModel.findOne({
        userId: req.id,
      });
      res.json({
        link: link?.hash,
      });
    }
  } else {
    await LinkModel.deleteOne({
      userId: req.id,
    });
    res.json({
      message: "updated sharable link",
    });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  try {
    const link = await LinkModel.findOne({
      hash,
    });
    if (!link) {
      res.status(411).json({
        message: "incorrect link",
      });
      return;
    }
    const content = await contentModel.find({
      userId: link.userId,
    });
    const user = await userModel.findOne({
      _id: link.userId,
    });

    res.json({
      username: user?.username,
      content,
    });
  } catch (e) {
    res.status(500).json({ message: "an error occured" });
  }
});

app.listen(PORT);
