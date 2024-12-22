import mongoose, { model, Model, Schema } from "mongoose";
import { MONGO_URL } from "./config";
mongoose.connect(MONGO_URL);

const UserSchema = new Schema({
  username: { type: String, unique: true, require: true },
  password: { type: String, require: true },
});

export const userModel = model("user", UserSchema);

const ContentSchema = new Schema({
  type: String,
  title: String,
  link: String,
  tags: [{ type: mongoose.Types.ObjectId, ref: "tag" }],
  userId: { type: mongoose.Types.ObjectId, ref: "user", require: true },
});

export const contentModel = model("content", ContentSchema);

const LinkSchema = new Schema({
  hash: String,
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    require: true,
    unique: true,
  },
});

export const LinkModel = model("links", LinkSchema);
