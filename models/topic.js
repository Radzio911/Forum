import { Schema, model, Types } from "mongoose";

const topicSchema = new Schema({
  title: String,
  description: String,
  createDate: Date,
  user: { type: Types.ObjectId, ref: "User" },
});

export const Topic = model("Topic", topicSchema, "topics");
