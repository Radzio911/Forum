import { Schema, model, Types } from "mongoose";

const commentSchema = new Schema({
  comment: String,
  createDate: Date,
  user: { type: Types.ObjectId, ref: "User" },
  topic: { type: Types.ObjectId, ref: "Topic" },
});

export const Comment = model("Comment", commentSchema, "comments");
